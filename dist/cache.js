'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storage;

var AMCache = function () {
    function AMCache() {
        (0, _classCallCheck3.default)(this, AMCache);
    }

    (0, _createClass3.default)(AMCache, null, [{
        key: 'addObjects',

        /* CREATE/UPDATE */

        value: function addObjects(type, objects, replaceAll) {
            return new Promise(function (fulfill, reject) {
                // console.log('AMCache.addObjects: ' + type, objects);

                // if (replaceAll) { console.log('ReplaceAll'); }

                // Get cached data
                // AMCache._getCache(type).then(doNextThing);

                AMCache._getCache(type).then(function (cache) {
                    // console.log('cache', cache);

                    if (replaceAll) {
                        cache = null;
                    }

                    if (Object.prototype.toString.call(cache) !== '[object Array]' && !replaceAll) {
                        console.warn('cache are not an array of objects', typeof cache === 'undefined' ? 'undefined' : (0, _typeof3.default)(cache));
                        cache = null;
                        console.warn('cache will be null');
                    }

                    // merge with cache collection
                    AMCache.mergeAndSetCache(cache, objects, type).then(function (data) {
                        // console.log('AMCache.addObjects - Saved Cache Result', data);
                        if (data === undefined) {
                            console.warn('Undefined on setItem????');
                        }
                        fulfill(data);
                    });
                }).catch(function (error) {
                    reject(error);
                });
            });
        }
    }, {
        key: 'mergeAndSetCache',
        value: function mergeAndSetCache(cache, objects, type) {
            objects = AMCache.merge(cache, objects);
            // store the new cache
            return AMCache._setCache(type, objects);
        }
    }, {
        key: 'merge',
        value: function merge(cache, objects) {
            // Validate - objects are array? objects have _id on root element?

            // console.log('cache', cache);
            if (!cache || cache.length === 0) {
                // console.log('just cache');
                cache = objects;
            } else {
                // console.log('do the merge');

                // Walk throught objects merging by id
                objects.map(function (object) {
                    if (!object._id) {
                        object._id = 'fake_' + new Date().getTime();
                        // console.log('Id created', object._id);
                    }

                    // find on cache
                    var index = cache.findIndex(function (item) {
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

    }, {
        key: 'delObjects',
        value: function delObjects(type, objectIds) {
            return new Promise(function (fulfill, reject) {
                // console.log('AMCache.delObjects: ' + type, objectIds);

                AMCache._getCache(type).then(function (cache) {
                    // console.log('cache', cache);

                    if (Object.prototype.toString.call(cache) !== '[object Array]') {
                        console.warn('cache are not an array of objects', typeof cache === 'undefined' ? 'undefined' : (0, _typeof3.default)(cache));
                        cache = null;
                        console.warn('cache will be null');
                    }

                    // merge with cache collection
                    AMCache.deleteAndSetCache(cache, objectIds, type).then(function (data) {
                        // console.log('AMCache.addObjects - Saved Cache Result', data);
                        if (data === undefined) {
                            console.warn('Undefined on setItem????');
                        }
                        fulfill(data);
                    });
                }).catch(function (error) {
                    reject(error);
                });
            });
        }
    }, {
        key: 'deleteAndSetCache',
        value: function deleteAndSetCache(cache, objectIds, type) {
            var objects = AMCache.del(cache, objectIds);
            return AMCache._setCache(type, objects);
        }

        // Delete some objects from cache

    }, {
        key: 'del',
        value: function del(cache, objectIds) {
            // Validate - objects are array? objects have _id on root element?

            if (!cache || cache.length === 0) {
                // console.log('just cache');
                return cache;
            } else {
                // console.log('do delete');

                // Walk throught objects deleting by id

                objectIds.map(function (objectId) {
                    // find on cache
                    var index = cache.findIndex(function (item) {
                        return item._id === objectId;
                    });

                    // console.log('index', index);
                    if (index > -1) {
                        // delete cache[index];
                        cache = cache.filter(function (item) {
                            return item._id !== objectId;
                        });
                    }
                });
                return cache;
            }
        }

        /* STORAGE ACCESS */

    }, {
        key: 'getObjects',
        value: function getObjects(type) {
            return AMCache._getCache(type);
        }
    }, {
        key: 'getObject',
        value: function getObject(type, id) {
            return new Promise(function (fulfill, reject) {
                AMCache._getCache(type).then(function (data) {
                    // console.log('data.length',data.length);
                    if (data === null || data.length === 0) {
                        fulfill(null);
                    } else {
                        var index = data.findIndex(function (item) {
                            // console.log(data);
                            // console.log(item);
                            return item._id === id;
                        });
                        // console.log('index', index);
                        if (index > -1) {
                            fulfill(data[index]);
                        }
                    }
                });
            });
        }
    }, {
        key: 'saveObject',
        value: function saveObject(type, object) {
            AMCache.addObjects(type, [object]);
        }
    }, {
        key: 'setStorage',
        value: function setStorage(store) {
            // console.log(store);
            storage = store;
        }
    }, {
        key: '_getCache',
        value: function _getCache(type) {
            type = AMCache.replaceAll(type, '_', '-');
            return storage.getItem(type);
        }
    }, {
        key: '_setCache',
        value: function _setCache(type, objects) {
            type = AMCache.replaceAll(type, '_', '-');
            return storage.setItem(type, objects);
        }
    }, {
        key: 'replaceAll',
        value: function replaceAll(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        }
    }]);
    return AMCache;
}();

exports.default = AMCache;