const amqp = require("amqplib/callback_api");

module.exports = function(couch, dbName) {
  amqp.connect(
    "amqp://localhost",
    function(err, conn) {
      conn.createChannel(function(err, ch) {
        const q = "delete_user";

        ch.assertQueue(q, { durable: false });
        ch.prefetch(1);
        console.log(" [x] Awaiting RPC requests");

        ch.consume(q, function reply(msg) {
          const n = JSON.parse(msg.content.toString());
          let response = {};

          console.log(" [.] server receive", n);

          console.warn("deleting user:", n);

          couch.get(dbName, n).then(
            ({ data, headers, status }) => {
              console.log('data on get by id:', data)
              couch
                .del(dbName, data._id, data._rev)
                .then(
                  ({ data, headers, status }) => {
                    console.log(data);

                    response = true;

                    console.log("response: ", response);
                  },
                  err => {
                    console.error(err);
                    response = false;
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
            },
            err => {
              // either request error occured
              // ...or err.code=EDOCMISSING if document is missing
              // ...or err.code=EUNKNOWN if statusCode is unexpected
            }
          );
        });
      });
    }
  );
};
