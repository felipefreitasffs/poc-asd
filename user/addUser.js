const amqp = require("amqplib/callback_api");

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
