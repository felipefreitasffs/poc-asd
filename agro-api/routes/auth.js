// var express = require('express');
// var router = express.Router();
var amqp = require('amqplib/callback_api');
var guid = require('../helpers/guid');

var socketService = require('../helpers/socket-service');
// var sessionService = require('../shared/session-service');

module.exports = function (socket) {
  socket.on("user:auth", function (username, password) {
    socketService.set(username, socket);

    var user = {
      username,
      password
    };

    socket.handshake.session.userdata = user;
    socket.handshake.session.save();

    console.log('user', user)

    checkAuthentication(user, socket)
  })
}


// /* GET home page. */
// router.post('/login', async function (req, res, next) {
//   var content = await checkAuthentication(req.body);
//   req.session.key = JSON.parse(content.toString());
//   res.end('done');
// });

// router.get('/logout', function (req, res) {
//   if (req.session.key) {
//     req.session.destroy(function () {
//       res.redirect('/');
//     });
//   } else {
//     res.redirect('/');
//   }
// });

function checkAuthentication(auth, socket) {
  // RPC to authentication module
  amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
      ch.assertQueue('', { exclusive: true }, function (err, q) {
        var corr = guid();

        console.log('GUID: ', corr);

        ch.consume(q.queue, function (msg) {
          console.log('consume')
          if (msg.properties.correlationId == corr) {
            // when user login set the key to redis.
            // req.session.key = JSON.parse(msg.content.toString());
            // res.end('done');
            // console.log('socket.request', socket.request)
            // socket.request.session['user'] = JSON.parse(msg.content.toString());
            socket.emit('user_accept', JSON.parse(msg.content.toString()))
            console.log(' Got ', JSON.parse(msg.content.toString()));
            setTimeout(function () { conn.close(); }, 500);
          }
        }, { noAck: true });

        var authUser = {
          username: auth.username,
          password: auth.password
        };

        ch.sendToQueue('auth_queue',
          new Buffer(JSON.stringify(authUser)),
          {
            correlationId: corr,
            replyTo: q.queue
          });
      });
    });
  });
}

// module.exports = router;