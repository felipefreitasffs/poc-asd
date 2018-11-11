# node-couchdb-plugin: redis

Plugin for [node-couchdb](https://www.npmjs.com/package/node-couchdb) to store cache inside Redis.

## API
```javascript
const Cache = require('node-couchdb-plugin-redis');

// accepts same arguments as [`redis createClient method`](https://www.npmjs.com/package/redis)
const cacheInstance = new Cache({
    host: '127.0.0.1',
    port: '6379', 
});
```
