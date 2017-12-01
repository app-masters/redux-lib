"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jsLib = require("@app-masters/js-lib");

var _amCacheActions = require("./amCacheActions");

var _amCacheActions2 = _interopRequireDefault(_amCacheActions);

var _cache = require("./cache");

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AMActions = function () {
    _createClass(AMActions, null, [{
        key: "setup",
        value: function setup(storage, callback) {
            // Validate
            if (!callback || !callback.onUncaughtError) throw "You must pass callback parameter to AMActions.setup, with onUncaughtError methods.";

            // Set it here
            _cache2.default.setStorage(storage);
            AMActions.callbacks = callback;
            AMActions.onUncaughtError(callback.onUncaughtError);
            _amCacheActions2.default.onUncaughtError(callback.onUncaughtError);
        }
    }]);

    function AMActions(config) {
        _classCallCheck(this, AMActions);

        _initialiseProps.call(this);

        // Validate config
        if (!config.validateObject || typeof config.validateObject !== "function") {
            console.warn('Your config', config);
            throw new Error("Every action must have a validateObject function on config");
        }

        if (!config.typePrefix || !config.endPoint || !config.defaultSort || !config.singularTitle || !config.pluralTitle) {
            console.warn('Your config', config);
            throw new Error("You must set your config! Please set at least: typePrefix, endPoint, defaultSort, singularTitle, pluralTitle");
        }

        // Save it here
        this.config = config;
    }

    // Change object to fit server requirements


    // Change object to fit client needs


    // Private methods

    _createClass(AMActions, null, [{
        key: "onUncaughtError",


        /// UncaughtError handlers

        value: function onUncaughtError(cbUncaughtError) {
            AMActions.onUncaught = cbUncaughtError;
        }
    }]);

    return AMActions;
}();

var _initialiseProps = function _initialiseProps() {
    var _this = this;

    this.validateSetup = function () {
        if (AMActions.onUncaught === null) {
            throw new Error("You must call AMActions.setup first. Please, read the readme at redux-lib.");
        }
    };

    this.getObjects = function (sort, populate, filter) {
        _this.validateSetup();
        return function (dispatch) {
            _this.setLoading(dispatch, true);
            _this.setError(dispatch, null);
            var url = _this.config.endPoint;
            sort = sort ? sort : _this.config.defaultSort;
            // console.warn("populate1",populate);
            populate = populate ? populate : _this.config.defaultPopulate;
            url += '?sort=' + sort;
            if (populate) {
                url += '&populate=' + populate;
                // console.warn("populate2",populate);
            }
            if (filter) {
                url += '&' + filter;
            }
            _jsLib.Http.get(url).then(function (response) {
                response = response.map(function (item) {
                    return _this.prepareToClient(item);
                });
                dispatch({ type: _this.type('GET_OBJECTS'), payload: response });
                _this.setLoading(dispatch, false);
            }).catch(function (error) {
                _this.onUncaught(error);
                _this.setLoading(dispatch, false);
            });
        };
    };

    this.getObject = function (id, populate) {
        return function (dispatch) {
            var url = _this.config.endPoint + id;
            if (populate !== false) {
                populate = populate ? populate : _this.config.defaultPopulate;
                url += '?populate=' + populate;
            }
            _this.setLoading(dispatch, true);
            _this.setError(dispatch, null);
            dispatch({ type: _this.type('NEW_OBJECT'), payload: {} });
            _jsLib.Http.get(url).then(function (response) {
                dispatch({ type: _this.type('GET_OBJECT'), payload: _this.prepareToClient(response) });
                _this.setLoading(dispatch, false);
            }).catch(function (error) {
                _this.onUncaught(error);
                _this.setLoading(dispatch, false);
                _this.setError(dispatch, error);
            });
        };
    };

    this.saveObject = function (input) {
        // Validate config
        if (!_this.config.validateObject || typeof _this.config.validateObject !== "function") {
            console.error('Your config', config);
            throw new Error("Every action must have a validateObject function on config");
        }

        var error = _this._validateObject(input);
        if (error) return function (dispatch) {
            return { type: _this.type('VALID'), payload: { message: error } };
        };

        // console.log('saveObject', input);
        if (input._id) {
            return _this.updateObject(input);
        } else {
            return _this.createObject(input);
        }
    };

    this.newObject = function (dispatch) {
        return function (dispatch) {
            _this.setLoading(dispatch, false);
            _this.setError(dispatch, null);
            dispatch({ type: _this.type('NEW_OBJECT'), payload: {} });
        };
    };

    this.prepareForm = function (match, populate) {
        _this.validateSetup();
        // console.log('match', match);
        if (match && match.params.id !== 'new') {
            // Editing
            // TODO: Corrigir o get object para não popular formulários complexos
            // Forcing populate when giving param
            populate = populate ? populate : false;
            return _this.getObject(match.params.id, populate);
        } else {
            // Inserting
            return _this.newObject();
        }
    };

    this.createObject = function (input) {
        // console.log('createObject ' + input);
        return function (dispatch) {
            input = _this.prepareToServer(input);
            _this.setLoading(dispatch, true);
            _this.setError(dispatch, null);
            _jsLib.Http.post(_this.config.endPoint, input).then(function (response) {
                dispatch({ type: _this.type('CREATE_OBJECT'), payload: _this.prepareToClient(response) });
                dispatch({ type: _this.type('SAVE_OBJECT'), payload: _this.prepareToClient(response) });
                _this.setLoading(dispatch, false);
            }).catch(function (error) {
                _this.onUncaught(error);
                _this.setLoading(dispatch, false);
                _this.setError(dispatch, error);
            });
        };
    };

    this.updateObject = function (input) {
        // console.log('updateObject ', input);
        return function (dispatch) {
            input = _this.prepareToServer(input);
            _this.setLoading(dispatch, true);
            _this.setError(dispatch, null);
            _jsLib.Http.put(_this.config.endPoint + input._id, input).then(function (response) {
                dispatch({ type: _this.type('UPDATE_OBJECT'), payload: _this.prepareToClient(response) });
                dispatch({ type: _this.type('SAVE_OBJECT'), payload: _this.prepareToClient(response) });
                _this.setLoading(dispatch, false);
            }).catch(function (error) {
                _this.onUncaught(error);
                _this.setLoading(dispatch, false);
                _this.setError(dispatch, error);
            });
        };
    };

    this.deleteObject = function (id) {
        return function (dispatch) {
            _this.setError(dispatch, null);
            _jsLib.Http.delete(_this.config.endPoint + id).then(function () {
                dispatch({ type: _this.type('DELETE_OBJECT'), payload: id });
            }).catch(function (error) {
                _this.onUncaught(error);
                _this.setError(dispatch, error);
            });
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

    this.test = function () {
        console.log('teste');
    };

    this.type = function (action) {
        return _this.config.typePrefix + '_' + action;
    };

    this.setLoading = function (dispatch, loading) {
        dispatch({ type: _this.type('LOADING'), payload: loading });
    };

    this.setError = function (dispatch, error) {
        dispatch({ type: _this.type('ERROR'), payload: error });
    };

    this.onUncaught = function (error) {
        if (AMActions.onUncaught) {
            AMActions.onUncaught(error);
        } else {
            console.warn("!!! onError not setted on AMCacheActions !!!");
            console.log(error);
        }
        console.error(error);
    };
};

AMActions.callbacks = {};
AMActions.onUncaught = null;

exports.default = AMActions;