const amqp = require("amqplib/callback_api");
const token = require("./helpers/token");
const CryptoJS = require("crypto-js");

module.exports = function(couch, dbName) {
  amqp.connect(
    "amqp://localhost",
    function(err, conn) {
      conn.createChannel(function(err, ch) {
        const q = "add_user";

        ch.assertQueue(q, { durable: false });
        ch.prefetch(1);
        console.log(" [x] Awaiting RPC requests");

        ch.consume(q, function reply(msg) {
          const n = JSON.parse(msg.content.toString());
          let response = {};

          console.log(" [.] server receive", n);

          if (n.profile.value === "specialCustomer") {
              n["token"] = token(36);
          }

          n.password = CryptoJS.SHA256(n.password, "agro app secret key").toString();

          couch
            .insert(dbName, n)
            .then(
              ({ data, headers, status }) => {
                console.log(data);

                response = "Ok";

                console.log("response: ", response);
              },
              err => {
                console.error(err);
                response = "Erro";
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
