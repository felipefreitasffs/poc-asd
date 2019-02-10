var amqp = require("amqplib/callback_api");
var guid = require("../helpers/guid");

module.exports = function(req, res) {
  console.log('req: ', req.params);
  console.log('req: ', req.body);

  if (!req.params.token) {
    res.sendStatus(400, 'missing authorization token');
    return;
  }
  
  checkToken(req.params.token, getBudget, res, req)
}

function checkToken(token, callback, response, request) {
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

                if (!message) {
                  response.status(401).send("Unauthorized");
                  return;
                }

                callback(response, request);

                // setTimeout(function() {
                conn.close();
                // }, 500);
              }
            },
            { noAck: true }
          );

          ch.sendToQueue("auth_token_queue", new Buffer(token), {
            correlationId: corr,
            replyTo: q.queue
          });
        });
      });
    }
  );
}

function getBudget (res, req) {
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

                res.send(message);                

                // setTimeout(function() {
                conn.close();
                // }, 500);
              }
            },
            { noAck: true }
          );

          ch.sendToQueue("special_customer_budget", new Buffer(JSON.stringify(req.body)), {
            correlationId: corr,
            replyTo: q.queue
          });
        });
      });
    }
  );
}