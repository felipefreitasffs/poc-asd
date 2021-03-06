const amqp = require("amqplib/callback_api");

module.exports = function(couch, dbName) {
  amqp.connect(
    "amqp://localhost",
    function(err, conn) {
      conn.createChannel(function(err, ch) {
        const q = "list_users";

        ch.assertQueue(q, { durable: false });
        ch.prefetch(1);
        console.log(" [x] Awaiting RPC requests");

        ch.consume(q, function reply(msg) {
          const n = JSON.parse(msg.content.toString());
          let response = {};

          console.log(" [.] server receive", n);

          const mangoQuery = n
            ? {
                selector: {
                  username: n.username
                }
              }
            : {};
          const parameters = {};

          couch
            .mango(dbName, mangoQuery, parameters)
            .then(
              ({ data, headers, status }) => {
                console.log(data);

                if (data.docs && data.docs.length) {
                  response = {
                    result: data.docs.length,
                    data: data.docs.map(user => {
                      return {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        profile: user.profile
                      };
                    })
                  };
                } else {
                  response = {
                    result: 0,
                    data: []
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
};
