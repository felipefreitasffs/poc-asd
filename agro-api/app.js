// https://github.com/pootzko/sesior

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var logger = require('morgan');
var redis = require("redis");
var session = require('express-session');
var path = require('path');
var http = require('http');
var io = require('socket.io');
var sharedsession = require("express-socket.io-session");

var authRoute = require('./routes/auth');
var usersRoute = require('./routes/users');

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

app.use(logger('dev'));

// log all requests to access.log
app.use(logger('combined', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}))

var cookie = cookieParser(config.sessionSecret)

app.use(cookie);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(allowCrossDomain);

var sessionConf = session({
  store: redisStore,
  name: config.sessionCookieKey,
  secret: config.sessionSecret,
  resave: true,
  saveUninitialized: true
});

// Attach session
app.use(sessionConf);

// Share session with io sockets
ioServer.use(sharedsession(sessionConf));

ioServer.sockets.on('connection', function (socket) {
  console.log('conectado no socket')
  authRoute(socket);
  usersRoute(socket);
});

module.exports = server;
