// https://github.com/pootzko/sesior

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var logger = require('morgan');
var redis = require("redis");
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var path = require('path');
var http = require('http');
var io = require('socket.io');

var authRoute = require('./routes/auth');

var app = express();

var server = http.createServer(app);
var ioServer = io.listen(server);

var redisClient = redis.createClient();
var RedisStore = require('connect-redis')(session);
var redisStore = new RedisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 260 });

// Other
var config = require('./config');
var sessionService = require('./helpers/session-service');
sessionService.initializeRedis(redisClient, redisStore);

// Enable CORS
var allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", config.allowedCORSOrigins);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
};

app.use(session({
  store: redisStore,
  key: config.sessionCookieKey,
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false
}));

app.use(logger('dev'));

// log all requests to access.log
app.use(logger('combined', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}))

app.use(cookieParser(config.sessionSecret));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(allowCrossDomain);

// Compartilhando a sessão válida do Express no Socket.IO
ioServer.use(function (socket, next) {
  var parseCookie = cookieParser(config.sessionSecret);
  var handshake = socket.request;

  parseCookie(handshake, null, function (err, data) {
    sessionService.get(handshake, function (err, session) {
      if (err)
        next(new Error(err.message));
      if (!session)
        next(new Error("Not authorized"));
      
      console.log('session', session)
      handshake.session = session;
      next();
    });
  });
});

ioServer.sockets.on('connection', function (socket) {
  authRoute(socket);
});

module.exports = server;
