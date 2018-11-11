'use strict';

import redis from 'redis';

export default class Cache {
    constructor(args) {
        this._cache = redis.createClient(args);
        this._storedKeys = [];
    }

    get(key) {
        return new Promise((resolve, reject) => {
            try {
                const data = this._cache.get(key, (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(JSON.parse(data) || null);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    set(key, value) {
        return new Promise((resolve, reject) => {
            this._storedKeys.push(key);
            try {
                this._cache.set(key, JSON.stringify(value), (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    invalidate() {
        return Promise.all(
            this._storedKeys.map((key) => {
                return new Promise((resolve, reject) => {
                    return this._cache.del(key, (err, data) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve();
                    });
                });
            })
        ).then(() => {
            this._storedKeys = [];
        });
    }
};
