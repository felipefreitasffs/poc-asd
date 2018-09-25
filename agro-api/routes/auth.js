var amqp = require("amqplib/callback_api");
var guid = require("../helpers/guid");

var socketService = require("../helpers/socket-service");

module.exports = function(socket) {
  socket.on("user_auth", function(username, password) {
    socketService.set(username, socket);

    var user = {
      username,
      password
    };

    checkAuthentication(user, socket);
  });
};

function checkAuthentication(auth, socket) {
  // RPC to authentication module
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
                const message = JSON.parse(msg.content.toString());
                console.log(" Got ", msg.content.toString());

                if (message.result) {
                  socket.handshake.session.userdata = message.data;
                  socket.handshake.session.save();
                  socket.emit("user_accept", message.data);
                } else {
                  socket.emit("user_denied");
                }

                // setTimeout(function() {
                conn.close();
                // }, 500);
              }
            },
            { noAck: true }
          );

          var authUser = {
            username: auth.username,
            password: auth.password
          };

          ch.sendToQueue("auth_queue", new Buffer(JSON.stringify(authUser)), {
            correlationId: corr,
            replyTo: q.queue
          });
        });
      });
    }
  );
}

// module.exports = router;
