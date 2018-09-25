const amqp = require("amqplib/callback_api");
const Cache = require("node-couchdb-plugin-redis");
const NodeCouchDb = require("node-couchdb");

const cacheInstance = new Cache({
  host: "localhost",
  port: "6379"
});

// node-couchdb instance with RedisCache
const couch = new NodeCouchDb({
  cache: cacheInstance
});

const dbName = "agro_users";

amqp.connect(
  "amqp://localhost",
  function(err, conn) {
    conn.createChannel(function(err, ch) {
      const q = "auth_queue";

      ch.assertQueue(q, { durable: false });
      ch.prefetch(1);
      console.log(" [x] Awaiting RPC requests");

      ch.consume(q, function reply(msg) {
        const n = JSON.parse(msg.content.toString());
        let response = {};

        console.log(" [.] server receive", n);

        const mangoQuery = {
          selector: {
            username: n.username,
            password: n.password
          }
        };
        const parameters = {};

        couch
          .mango(dbName, mangoQuery, parameters)
          .then(
            ({ data, headers, status }) => {
              console.log(data);

              if (data.docs && data.docs.length) {
                response = {
                  result: 1,
                  data: {
                    name: data.docs[0].name,
                    username: data.docs[0].username,
                    profile: data.docs[0].profile
                  }
                };
              } else {
                response = {
                  result: 0
                };
              }

              console.log("response: ", response);
            },
            err => {
              console.error(err);
              response = {
                result: -1
              };
            }
          )
          .then(() => {
            ch.sendToQueue(
              msg.properties.replyTo,
              new Buffer(JSON.stringify(response)),
              {
                correlationId: msg.properties.correlationId
              }
            );

            ch.ack(msg);
          });
      });
    });
  }
);
