var amqp = require("amqplib/callback_api");
var guid = require("./guid");

function queue(message, socket, queueName, socketToReturn) {
  amqp.connect(
    "amqp://localhost",
    function(err, conn) {
      conn.createChannel(function(err, ch) {
        ch.assertQueue("", { exclusive: true }, function(err, q) {
          var corr = guid();

          console.log("GUID: ", corr);

          ch.consume(
            q.queue,
            function(msg) {
              if (msg.properties.correlationId == corr) {
                const jsonMessage = JSON.parse(msg.content.toString());
                console.log(" Got ", msg.content.toString());

                socket.emit(socketToReturn, jsonMessage.data);

                conn.close();
              }
            },
            { noAck: true }
          );

          ch.sendToQueue(queueName, new Buffer(JSON.stringify(message)), {
            correlationId: corr,
            replyTo: q.queue
          });
        });
      });
    }
  );
}

module.exports = queue;