var storage;

class AMCache {
    /* CREATE/UPDATE */

    static addObjects (type, objects, replaceAll) {
        return new Promise((fulfill, reject) => {
            // console.log('AMCache.addObjects: ' + type, objects);

            // if (replaceAll) { console.log('ReplaceAll'); }

            // Get cached data
            // AMCache._getCache(type).then(doNextThing);

            AMCache._getCache(type).then(cache => {
                // console.log('cache', cache);

                if (replaceAll) { cache = null; }

                if (cache && Object.prototype.toString.call(cache) !== '[object Array]' && !replaceAll) {
                    console.warn('cache are not an array of objects', typeof cache);
                    cache = null;
                    console.warn('cache will be null');
                }

                // merge with cache collection
                AMCache.mergeAndSetCache(cache, objects, type).then(data => {
                    // console.log('AMCache.addObjects - Saved Cache Result', data);
                    if (data === undefined) { console.warn('Undefined on setItem????'); }
                    fulfill(data);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }

    static mergeAndSetCache (cache, objects, type) {
        objects = AMCache.merge(cache, objects);
        // store the new cache
        return AMCache._setCache(type, objects);
    }

    static merge (cache, objects) {
        // Validate - objects are array? objects have _id on root element?
        if (objects && objects.length > 0) {
            objects = objects.map(object => {
                if (!object._id) {
                    return {_id: 'fake_' + new Date().getTime(), ...object};
                }
            });
        } else {
            if (objects && !objects._id) {
                objects = {_id: 'fake_' + new Date().getTime(), ...objects};
            }
        }

        // console.log('cache', cache);
        if (!cache || cache.length === 0) {
            // console.log('just cache');
            cache = objects;
        } else {
            // console.log('do the merge');

            // Walk throught objects merging by id
            objects.map(object => {
                // find on cache
                let index = cache.findIndex(item => {
                    return item._id === object._id;
                });
                // console.log('index', index);
                if (index > -1) {
                    cache[index] = object;
                } else {
                    // console.log('AMCache Item added', object);
                    cache.push(object);
                }

                // console.log('object', object);
                // let id = object._id;
                // console.log('id', id);
            });
        }

        return cache;
    }

    /* DELETE */

    static delObjects (type, objectIds) {
        return new Promise((fulfill, reject) => {
            // console.log('AMCache.delObjects: ' + type, objectIds);

            AMCache._getCache(type).then(cache => {
                // console.log('cache', cache);

                if (Object.prototype.toString.call(cache) !== '[object Array]') {
                    console.warn('cache are not an array of objects', typeof cache);
                    cache = null;
                    console.warn('cache will be null');
                }

                // merge with cache collection
                AMCache.deleteAndSetCache(cache, objectIds, type).then(data => {
                    // console.log('AMCache.addObjects - Saved Cache Result', data);
                    if (data === undefined) { console.warn('Undefined on setItem????'); }
                    fulfill(data);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }

    static deleteAndSetCache (cache, objectIds, type) {
        let objects = AMCache.del(cache, objectIds);
        return AMCache._setCache(type, objects);
    }

    // Delete some objects from cache
    static del (cache, objectIds) {
        // Validate - objects are array? objects have _id on root element?

        if (!cache || cache.length === 0) {
            // console.log('just cache');
            return cache;
        } else {
            // console.log('do delete');

            // Walk throught objects deleting by id

            objectIds.map(objectId => {
                // find on cache
                let index = cache.findIndex(item => {
                    return item._id === objectId;
                });

                // console.log('index', index);
                if (index > -1) {
                    // delete cache[index];
                    cache = cache.filter(item => {
                        return item._id !== objectId;
                    });
                }
            });
            return cache;
        }
    }

    /* STORAGE ACCESS */

    static getObjects (type) {
        return AMCache._getCache(type);
    }

    static getObject (type, id) {
        return new Promise((fulfill, reject) => {
            AMCache._getCache(type).then(data => {
                // console.log('data.length',data.length);
                if (data === null || data.length === 0) {
                    fulfill(null);
                } else {
                    let index = data.findIndex(item => {
                        // console.log(data);
                        // console.log(item);
                        return item._id === id;
                    });
                    // console.log('index', index);
                    if (index > -1) {
                        fulfill(data[index]);
                    } else {
                        fulfill(null);
                    }
                }
            });
        });
    }

    static saveObject (type, object) {
        AMCache.addObjects(type, [object]);
    }

    static setStorage (store) {
        // console.log(store);
        storage = store;
    }

    static _getCache (type) {
        type = AMCache.replaceAll(type, '_', '-');
        return storage.getItem(type);
    }

    static _setCache (type, objects) {
        type = AMCache.replaceAll(type, '_', '-');
        return storage.setItem(type, objects);
    }

    static replaceAll (str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
}

export default AMCache;