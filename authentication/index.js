var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'auth_queue';

    ch.assertQueue(q, {durable: false});
    ch.prefetch(1);
    console.log(' [x] Awaiting RPC requests');
    ch.consume(q, function reply(msg) {
      var n = JSON.parse(msg.content.toString());

      console.log(" [.] server recebeu", n);

      var r = n;

      ch.sendToQueue(msg.properties.replyTo,
        new Buffer(JSON.stringify(r)),
        {correlationId: msg.properties.correlationId});

      ch.ack(msg);
    });
  });
});