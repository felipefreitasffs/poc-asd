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

const productsDbName = "agro_products";
const budgetsDbName = "agro_budgets";

var specialCustomer = require('./specialCustomer');
specialCustomer(couch, productsDbName, budgetsDbName);