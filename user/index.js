const Cache = require("node-couchdb-plugin-redis");
const NodeCouchDb = require("node-couchdb");

const cacheInstance = new Cache({
  host: "localhost",
  port: "6379"
});

// node-couchdb instance with RedisCache
const couch = new NodeCouchDb({
  cache: cacheInstance
});

const userDbName = "agro_users";
const profileDbName = "agor_profiles";

var listUsers = require('./listUsers');
listUsers(couch, userDbName);

var addUser = require('./addUser');
addUser(couch, userDbName);

var deleteUser = require('./deleteUser');
deleteUser(couch, userDbName);

var editUser = require('./editUser');
editUser(couch, userDbName);

var listProfiles = require('./listProfiles');
listProfiles(couch, profileDbName);
