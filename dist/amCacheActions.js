'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _jsLib = require('@app-masters/js-lib');

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AMCacheActions = function () {
    function AMCacheActions(config) {
        var _this = this;

        (0, _classCallCheck3.default)(this, AMCacheActions);

        this.validateSetup = function () {
            if (AMCacheActions.onUncaught === null) {
                throw new Error('You must call AMActions.setup first. Please, read the readme at redux-lib.');
            }
        };

        this.doSave = function (cacheStrategy, alwaysReturn, promiseCache, promiseOnline) {
            console.log('doSave', cacheStrategy);
            if (cacheStrategy === 'CacheOnline' || cacheStrategy === 'CacheEmptyOnline') {
                _this.doSaveCacheOnline(alwaysReturn, promiseCache, promiseOnline);
            } else if (cacheStrategy === 'Cache') {
                _this.doSaveCache(alwaysReturn, promiseCache);
            } else if (cacheStrategy === 'Online') {
                _this.doSaveOnline(alwaysReturn, promiseOnline);
            }
        };

        this.doSaveCacheOnline = function (alwaysReturn, promiseCache, promiseOnline) {
            // console.log("doSaveCacheOnline");
            promiseCache().then(function (result) {
                // console.log('1result', result);
                alwaysReturn(result, true);
                promiseOnline().then(function (result) {
                    // console.log('2result', result);
                    alwaysReturn(result, false, true);
                });
            }).catch(function (err) {
                _this.onUncaught(err);
            });
        };

        this.doSaveCache = function (alwaysReturn, promiseCache) {
            // console.log("doSaveCache");
            promiseCache().then(function (result) {
                alwaysReturn(result, true, true);
            }).catch(function (err) {
                _this.onUncaught(err);
            });
        };

        this.doSaveOnline = function (alwaysReturn, promiseOnline) {
            // console.log("doSaveOnline");
            promiseOnline().then(function (result) {
                alwaysReturn(result, false, true);
            }).catch(function (err) {
                _this.onUncaught(err);
            });
        };

        this.doGet = function (cacheStrategy, alwaysReturn, promiseOnline, promiseCache) {
            _this.validateSetup();
            // console.log("doGet", cacheStrategy);
            if (cacheStrategy === 'CacheOnline') {
                _this.doGetCacheOnline(alwaysReturn, promiseOnline, promiseCache);
            } else if (cacheStrategy === 'Cache') {
                _this.doGetCache(alwaysReturn, promiseCache);
            } else if (cacheStrategy === 'CacheEmptyOnline') {
                _this.doGetCacheEmptyOnline(alwaysReturn, promiseOnline, promiseCache);
            } else if (cacheStrategy === 'Online') {
                _this.doGetOnline(alwaysReturn, promiseOnline);
            }

            // doIfCache(sempreRetornar, promessaCacheInativo, promessaCacheAtivo);
            //
        };

        this.doGetCacheOnline = function (alwaysReturn, promiseOnline, promiseCache) {
            _this.validateSetup();
            // console.log("doGetCacheOnline");
            promiseCache().then(function (result) {
                // console.log('promiseCache result', result);
                if (result && result.length > 0) {
                    // result.pop(); //
                    // result.shift(); //
                }
                alwaysReturn(result, true, false);
                // setTimeout(() => {
                promiseOnline().then(function (result) {
                    alwaysReturn(result, false, true);
                });
                // }, 3000);
            }).catch(function (err) {
                _this.onUncaught(err);
            });
        };

        this.doGetCache = function (alwaysReturn, promiseCache) {
            _this.validateSetup();
            // console.log("doGetCache");
            promiseCache().then(function (result) {
                console.log('promiseCache result', result);
                _this._countFakeRecords(result);
                alwaysReturn(result, true, true);
            }).catch(function (err) {
                _this.onUncaught(err);
            });
        };

        this.doGetCacheEmptyOnline = function (alwaysReturn, promiseOnline, promiseCache) {
            _this.validateSetup();
            // console.log("doGetCacheEmptyOnline");
            promiseCache().then(function (result) {
                // console.log('promiseCache result', result);
                // result = null; //
                alwaysReturn(result, true, false);
                if (!result || result.length === 0) {
                    // setTimeout(() => {
                    promiseOnline().then(function (result) {
                        alwaysReturn(result, false, true);
                    });
                    // }, 1000);
                }
            }).catch(function (err) {
                _this.onUncaught(err);
            });
        };

        this.doGetOnline = function (alwaysReturn, promiseOnline) {
            _this.validateSetup();
            // console.log("doGetOnline");
            promiseOnline().then(function (result) {
                alwaysReturn(result, false, true);
            }).catch(function (err) {
                _this.onUncaught(err);
            });
        };

        this.getObjects = function (sort, populate, filter) {
            return function (dispatch) {
                try {
                    _this.setLoading(dispatch, true, _this.config.cacheStrategy !== 'Online', _this.config.cacheStrategy !== 'Cache');
                    _this.setError(dispatch, null);

                    //console.log("ok");
                    // Everymotherfuckercase
                    var sempreRetornar = function sempreRetornar(response, fromCache, final) {
                        if (final === true) _this.setLoading(dispatch, false, false, false);else if (fromCache === true) _this.setLoadingFrom(dispatch, 'CACHE', false);else if (fromCache === false) _this.setLoadingFrom(dispatch, 'ONLINE', false);else console.log('from where??');

                        // console.log("getObjects.sempreRetornar");
                        _this.dispatchGetObjects(dispatch, response, fromCache, filter);
                    };
                    var promessaCache = function promessaCache() {
                        // console.log("getObjects.promessaCache");
                        _this.setLoadingFrom(dispatch, 'CACHE', true);
                        return _cache2.default.getObjects(_this.config.typePrefix);
                    };
                    var promessaOnline = function promessaOnline() {
                        // console.log("getObjects.promessaOnline");
                        _this.setLoadingFrom(dispatch, 'ONLINE', true);
                        return _this._getObjects(sort, populate, filter);
                    };

                    _this.doGet(_this.config.cacheStrategy, sempreRetornar, promessaOnline, promessaCache);
                } catch (err) {
                    _this.onUncaught(err);
                }
            };
        };

        this.getObject = function (id, populate) {
            return function (dispatch) {
                try {
                    _this.setLoading(dispatch, true, _this.config.cacheStrategy !== 'Online', _this.config.cacheStrategy !== 'Cache');
                    _this.setError(dispatch, null);
                    dispatch({ type: _this.type('NEW_OBJECT'), payload: {} });

                    // Everymotherfuckercase
                    var sempreRetornar = function sempreRetornar(response, fromCache, final) {
                        if (final === true) _this.setLoading(dispatch, false, false, false);else if (fromCache === true) _this.setLoadingFrom(dispatch, 'CACHE', false);else if (fromCache === false) _this.setLoadingFrom(dispatch, 'ONLINE', false);else console.log('from where??');

                        //console.log("getObject.sempreRetornar");
                        _this.dispatchGetObject(dispatch, response, fromCache);
                    };
                    var promessaCacheAtivo = function promessaCacheAtivo() {
                        // console.log("getObject.promessaCacheAtivo");
                        _this.setLoadingFrom(dispatch, 'CACHE', true);
                        return _cache2.default.getObject(_this.config.typePrefix, id);
                    };
                    var promessaCacheInativo = function promessaCacheInativo() {
                        // console.log("getObject.promessaCacheInativo");
                        _this.setLoadingFrom(dispatch, 'ONLINE', true);
                        return _this._getObject(id, populate);
                    };

                    _this.doGet(_this.config.cacheStrategy, sempreRetornar, promessaCacheInativo, promessaCacheAtivo);
                } catch (err) {
                    _this.onUncaught(err);
                }
            };
        };

        this.saveObject = function (input, justCache) {
            var error = _this._validateObject(input);
            if (error) return function (dispatch) {
                return { type: _this.type('VALID'), payload: { message: error } };
            };

            // console.log('saveObject', input);
            if (input._id) {
                return _this.updateObject(input, justCache);
            } else {
                return _this.createObject(input, justCache);
            }
        };

        this.saveObjectCache = function (input) {
            return _this.saveObject(input, true);
        };

        this.newObject = function (dispatch) {
            return function (dispatch) {
                _this.setLoading(dispatch, false, false, false);
                _this.setError(dispatch, null);
                dispatch({ type: _this.type('NEW_OBJECT'), payload: {} });
            };
        };

        this.prepareForm = function (match) {
            // console.log('match', match);
            if (match && match.params.id !== 'new') {
                // Editing
                // TODO: Corrigir o get object para não popular formulários complexos
                return _this.getObject(match.params.id, false);
            } else {
                // Inserting
                return _this.newObject();
            }
        };

        this.createObject = function (input, justCache) {
            return function (dispatch) {

                try {
                    input = _this.prepareToServer(input);

                    _this.setLoading(dispatch, true, _this.config.cacheStrategy !== 'Online', _this.config.cacheStrategy !== 'Cache');
                    _this.setError(dispatch, null);

                    // Everymotherfuckercase
                    var sempreRetornar = function sempreRetornar(response, fromCache, final) {
                        if (final === true) _this.setLoading(dispatch, false, false, false);else if (fromCache === true) _this.setLoadingFrom(dispatch, 'CACHE', false);else if (fromCache === false) _this.setLoadingFrom(dispatch, 'ONLINE', false);else console.log('from where??');

                        _this.dispatchSaveObject(dispatch, response, 'CREATE_OBJECT');
                    };
                    var promessaCache = function promessaCache() {
                        _this.setLoadingFrom(dispatch, 'CACHE', true);
                        return _cache2.default.addObjects(_this.config.typePrefix, [input]);
                    };
                    var promessaOnline = function promessaOnline() {
                        _this.setLoadingFrom(dispatch, 'ONLINE', true);
                        delete input['_id'];
                        return _this._createObject(input);
                    };

                    if (justCache) promessaOnline = null;

                    _this.doSave(_this.config.cacheStrategy, sempreRetornar, promessaCache, promessaOnline);
                } catch (err) {
                    _this.onUncaught(err);
                }
            };
        };

        this._createObject = function (input) {
            return _jsLib.Http.post(_this.config.endPoint, input);
        };

        this.updateObject = function (input, justCache) {
            // console.log('updateObject ' + input);
            return function (dispatch) {

                try {
                    var id = input._id;
                    input = _this.prepareToServer(input);

                    _this.setLoading(dispatch, true, _this.config.cacheStrategy !== 'Online', _this.config.cacheStrategy !== 'Cache');
                    _this.setError(dispatch, null);

                    // Everymotherfuckercase
                    var sempreRetornar = function sempreRetornar(response, fromCache, final) {
                        if (final === true) _this.setLoading(dispatch, false, false, false);else if (fromCache === true) _this.setLoadingFrom(dispatch, 'CACHE', false);else if (fromCache === false) _this.setLoadingFrom(dispatch, 'ONLINE', false);else console.log('from where??');

                        // console.log("updateObject.sempreRetornar");
                        _this.dispatchSaveObject(dispatch, response, 'UPDATE_OBJECT');
                    };
                    var promessaCache = function promessaCache() {
                        // console.log("updateObject.promessaCache", input);
                        _this.setLoadingFrom(dispatch, 'CACHE', true);
                        return _cache2.default.addObjects(_this.config.typePrefix, [input]);
                    };
                    var promessaOnline = function promessaOnline() {
                        // console.log("pupdateObject.romessaOnline");
                        delete input['_id'];
                        _this.setLoadingFrom(dispatch, 'ONLINE', true);
                        return _this._updateObject(id, input);
                    };

                    if (justCache) promessaOnline = null;

                    _this.doSave(_this.config.cacheStrategy, sempreRetornar, promessaCache, promessaOnline);
                } catch (err) {
                    _this.onUncaught(err);
                }
            };
        };

        this.deleteObject = function (id) {
            return function (dispatch) {

                try {
                    _this.setLoading(dispatch, true, _this.config.cacheStrategy !== 'Online', _this.config.cacheStrategy !== 'Cache');
                    _this.setError(dispatch, null);

                    // Everymotherfuckercase
                    var sempreRetornar = function sempreRetornar(response, fromCache, final) {
                        if (final === true) _this.setLoading(dispatch, false, false, false);else if (fromCache === true) _this.setLoadingFrom(dispatch, 'CACHE', false);else if (fromCache === false) _this.setLoadingFrom(dispatch, 'ONLINE', false);else console.log('from where??');

                        // console.log("updateObject.sempreRetornar");
                        _this._dispatchDeleteObject(dispatch, id);
                    };
                    var promessaCache = function promessaCache() {
                        // console.log("updateObject.promessaCache");
                        _this.setLoadingFrom(dispatch, 'CACHE', true);
                        return _cache2.default.delObjects(_this.config.typePrefix, [id]);
                    };
                    var promessaOnline = function promessaOnline() {
                        // console.log("pupdateObject.romessaOnline");
                        _this.setLoadingFrom(dispatch, 'ONLINE', true);
                        return _this._deleteObject(id);
                    };

                    _this.doSave(_this.config.cacheStrategy, sempreRetornar, promessaCache, promessaOnline);
                } catch (error) {
                    _this.onUncaught(err);
                    _this.setError(dispatch, error);
                }
            };
        };

        this.deleteSyncData = function () {
            return function (dispatch) {

                try {
                    _this.setLoading(dispatch, true, _this.config.cacheStrategy !== 'Online', _this.config.cacheStrategy !== 'Cache');
                    _this.setError(dispatch, null);

                    // Get fake ids
                    var syncRecords = _this.getSyncData();
                    var ids = [];
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = syncRecords[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var record = _step.value;

                            console.log(record);
                            ids.push(record._id);
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    console.log(ids);

                    // Everymotherfuckercase
                    var sempreRetornar = function sempreRetornar(response, fromCache, final) {
                        if (final === true) _this.setLoading(dispatch, false, false, false);else if (fromCache === true) _this.setLoadingFrom(dispatch, 'CACHE', false);else if (fromCache === false) _this.setLoadingFrom(dispatch, 'ONLINE', false);else console.log('from where??');

                        _this.syncRecords = [];
                        _this.syncRecordsCount = 0;

                        // console.log("updateObject.sempreRetornar");
                        _this._dispatchDeleteObject(dispatch, ids);
                    };
                    var promessaCache = function promessaCache() {
                        // console.log("updateObject.promessaCache");
                        _this.setLoadingFrom(dispatch, 'CACHE', true);
                        return _cache2.default.delObjects(_this.config.typePrefix, ids);
                    };

                    _this.doSave(_this.config.cacheStrategy, sempreRetornar, promessaCache, null);
                } catch (error) {
                    _this.onUncaught(err);
                    _this.setError(dispatch, error);
                }
            };
        };

        this.inputChanged = function (key, value) {
            return { type: _this.type('INPUT_CHANGED'), payload: { key: key, value: value } };
        };

        this.validateObject = function (item) {
            var error = _this._validateObject(item);
            if (error) {
                return { type: _this.type('VALID'), payload: { message: error } };
            } else {
                return { type: _this.type('VALID'), payload: true };
            }
        };

        this._validateObject = function (item) {
            var error = null;
            // Run default validations based on schema
            // 1 - Required fields
            // 2 - Data types
            // 3 - Extra fields (warning in console(dev) and rollbar (prod))

            // run custom validate
            if (_this.config.validateObject) {
                error = _this.config.validateObject(item);
            }

            return error;
        };

        this.prepareToServer = function (item) {
            // Remove server data
            // delete item['_id'];
            // Default removes
            delete item['created_at'];
            delete item['updated_at'];
            delete item['__v'];
            delete item['_virtual'];

            // Have a custom prepareToServer?
            if (_this.config.prepareToServer) {
                item = _this.config.prepareToServer(item);
            }

            return item;
        };

        this.prepareToClient = function (item) {
            if (_this.config.prepareToClient) {
                item = _this.config.prepareToClient(item);
            }

            return item;
        };

        this.type = function (action) {
            return _this.config.typePrefix + '_' + action;
        };

        this.setLoading = function (dispatch, loading, loadingCache, loadingOnline) {
            // console.log('setLoading loadingCache', loadingCache);
            // console.log('setLoading loadingOnline', loadingOnline);
            dispatch({ type: _this.type('LOADING'), payload: loading });
            if (loadingCache !== undefined) dispatch({ type: _this.type('LOADING_CACHE'), payload: loadingCache });
            if (loadingOnline !== undefined) dispatch({ type: _this.type('LOADING_ONLINE'), payload: loadingOnline });
        };

        this.setLoadingFrom = function (dispatch, from, loading) {
            // console.log("setLoadingFrom " + from, loading);
            dispatch({ type: _this.type('LOADING_' + from), payload: loading });
        };

        this.setError = function (dispatch, error) {
            dispatch({ type: _this.type('ERROR'), payload: error });
        };

        this.hasSyncData = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var records;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return _cache2.default.getObjects(_this.config.typePrefix);

                        case 2:
                            records = _context.sent;

                            _this._countFakeRecords(records);
                            return _context.abrupt('return', _this.getCountSyncData() > 0);

                        case 5:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }));

        this.getCountSyncData = function () {
            return _this.syncRecordsCount;
        };

        this.getSyncData = function () {
            return _this.syncRecords;
        };

        this.onUncaught = function (error) {
            if (AMCacheActions.onUncaught) {
                AMCacheActions.onUncaught(error);
            } else {
                console.warn('!!! onError not setted on AMActions !!!');
                console.log(error);
            }
            console.error(error);
        };

        // Validate config
        if (!config.validateObject || typeof config.validateObject !== 'function') {
            console.log('Your config', config);
            throw new Error('Every action must have a validateObject function on config');
        }

        if (!config.typePrefix || !config.endPoint || !config.defaultSort || !config.singularTitle || !config.pluralTitle) {
            console.log('Your config', config);
            throw new Error('You must set your config! Please set at least: typePrefix, endPoint, defaultSort, singularTitle, pluralTitle');
        }

        if (!config.cacheStrategy || ['CacheOnline', 'CacheEmptyOnline', 'Cache', 'Online'].indexOf(config.cacheStrategy) < 0) {
            console.warn(config.typePrefix + ' withou cacheStrategy defined. Using CacheOnline now');
            config.cacheStrategy = 'CacheOnline';
        }

        // Save it here
        this.config = config;
        this.syncRecords = [];
        this.syncRecordsCount = 0;
    }

    //// GENERIC METHOS to work for all promisses and possibilities here

    // 1 - CacheOnline - Obter do cache, depois online
    // 2 - Cache - Obter do cache apenas
    // 3 - CacheEmptyOnline - Obter do cache, se não tiver cache, obter online
    // 4 - Online - Obter online apenas

    // 1 - CacheOnline - Obter do cache, depois online


    // 2 - Cache - Obter do cache apenas


    // 4 - Online - Salvar online apenas


    // 1 - CacheOnline - Obter do cache, depois online
    // 2 - Cache - Obter do cache apenas
    // 3 - CacheEmptyOnline - Obter do cache, se não tiver cache, obter online
    // 4 - Online - Obter online apenas

    // 1 - CacheOnline - Obter do cache, depois online


    (0, _createClass3.default)(AMCacheActions, [{
        key: '_countFakeRecords',
        value: function _countFakeRecords(records) {
            var _this2 = this;

            // count fake records
            this.syncRecords = [];
            // console.log("fakesCount", fakesCount);
            if (!records) {
                this.syncRecordsCount = 0;
            } else {
                this.syncRecordsCount = records.reduce(function (count, record) {
                    // console.log(record);
                    // console.log(record._id);
                    if (record && record._id && record._id.indexOf('fake') > -1) {
                        _this2.syncRecords.push(record);
                        return count + 1;
                    } else return count;
                }, 0);
                return this.syncRecordsCount;
            }
        }

        // cache ok

    }, {
        key: 'dispatchGetObjects',
        value: function dispatchGetObjects(dispatch, response, fromCache, filter) {
            var _this3 = this;

            // console.log('fromCache',fromCache);
            // console.log('filter',filter);
            if (Object.prototype.toString.call(response) === '[object Array]') response = response.map(function (item) {
                return _this3.prepareToClient(item);
            });else response = []; //
            // When Online, always use API data
            if (this.config.cacheStrategy === 'Online') {
                // console.log('dispatchGetObjects', 'Online');
                dispatch({ type: this.type('GET_OBJECTS'), payload: response });
                // this.setLoading(dispatch, false);
            } else {
                // console.log('dispatchGetObjects', 'else');

                // When using cache, always SHOW cache data, even when getting from API first
                var replaceAll = fromCache === false && !filter;
                // let replaceAll = true;
                _cache2.default.addObjects(this.config.typePrefix, response, replaceAll).then(function (response) {
                    dispatch({ type: _this3.type('GET_OBJECTS'), payload: response });
                    // this.setLoading(dispatch, false);
                });
            }
        }
    }, {
        key: '_getObjects',
        value: function _getObjects(sort, populate, filter) {
            var url = this.config.endPoint;
            sort = sort ? sort : this.config.defaultSort;
            populate = populate ? populate : this.config.defaultPopulate;
            url += '?sort=' + sort;
            if (populate) {
                url += '&populate=' + populate;
            }
            if (filter) url += '&' + filter;
            return _jsLib.Http.get(url);
        }

        /* GET OBJECTS */

    }, {
        key: '_getObject',
        value: function _getObject(id, populate) {
            var url = this.config.endPoint + id;
            if (populate !== false) {
                populate = populate ? populate : this.config.defaultPopulate;
                url += '?populate=' + populate;
            }
            return _jsLib.Http.get(url);
        }
    }, {
        key: 'dispatchGetObject',
        value: function dispatchGetObject(dispatch, response, fromCache) {
            // console.log('aa',Object.prototype.toString.call(response));
            if (Object.prototype.toString.call(response) === '[object Object]') response = this.prepareToClient(response);else response = {};
            if (this.config.cacheStrategy === 'Online') {
                // console.log('dispatchGetObject', 'Online');
                dispatch({ type: this.type('GET_OBJECT'), payload: response });
                this.setLoading(dispatch, false);
            } else {
                _cache2.default.addObjects(this.config.typePrefix, [response]);
                dispatch({ type: this.type('GET_OBJECT'), payload: response });
                // console.log('dispatch', response);
                this.setLoading(dispatch, false);
            }
        }

        /* UPDATE */

    }, {
        key: '_updateObject',
        value: function _updateObject(id, input) {
            return _jsLib.Http.put(this.config.endPoint + id, input);
        }
    }, {
        key: 'dispatchSaveObject',
        value: function dispatchSaveObject(dispatch, response, secondaryAction) {
            dispatch({ type: this.type(secondaryAction), payload: this.prepareToClient(response) }); // broadcast
            dispatch({ type: this.type('SAVE_OBJECT'), payload: this.prepareToClient(response) });
            this.setLoading(dispatch, false);
        }

        /* DELETE */

    }, {
        key: '_deleteObject',
        value: function _deleteObject(id) {
            return _jsLib.Http.delete(this.config.endPoint + id);
        }
    }, {
        key: '_dispatchDeleteObject',
        value: function _dispatchDeleteObject(dispatch, id) {
            var _this4 = this;

            console.log('constructorName', id.constructor.name);
            if (id.constructor.name === 'Array') {
                id.map(function (oId) {
                    dispatch({ type: _this4.type('DELETE_OBJECT'), payload: oId });
                });
            } else {
                dispatch({ type: this.type('DELETE_OBJECT'), payload: id });
            }
        }

        /* OTHER ACTIONS */

        // Change object to fit server requirements


        // Change object to fit client needs


        // Private methods

    }], [{
        key: 'onUncaughtError',


        // clearSyncData = async () => {
        //     let syncRecords = this.getSyncData();
        //     let ids = [];
        //     for (let record of syncRecords) {
        //         console.log(record);
        //         ids.push(record._id);
        //     }
        //     console.log(ids);
        //     let ok = await AMCache.delObjects(this.config.typePrefix, ids);
        //     console.log(ok);
        // }

        /// UncaughtError handlers

        value: function onUncaughtError(cbUncaughtError) {
            AMCacheActions.onUncaught = cbUncaughtError;
        }
    }]);
    return AMCacheActions;
}();

AMCacheActions.onUncaught = null;

exports.default = AMCacheActions;