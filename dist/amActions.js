"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _jsLib = require("@app-masters/js-lib");

var _amCacheActions = _interopRequireDefault(require("./amCacheActions"));

var _cache = _interopRequireDefault(require("./cache"));

var AMActions =
/*#__PURE__*/
function () {
  (0, _createClass2.default)(AMActions, null, [{
    key: "setup",
    value: function setup(storage, callback) {
      // Validate
      if (!callback || !callback.onUncaughtError) throw "You must pass callback parameter to AMActions.setup, with onUncaughtError methods."; // Set it here

      _cache.default.setStorage(storage);

      AMActions.callbacks = callback;
      AMActions.onUncaughtError(callback.onUncaughtError);

      _amCacheActions.default.onUncaughtError(callback.onUncaughtError);
    }
  }]);

  function AMActions(_config) {
    var _this = this;

    (0, _classCallCheck2.default)(this, AMActions);
    (0, _defineProperty2.default)(this, "validateSetup", function () {
      if (AMActions.onUncaught === null) {
        throw new Error("You must call AMActions.setup first. Please, read the readme at redux-lib.");
      }
    });
    (0, _defineProperty2.default)(this, "getObjects", function (sort, populate, filter) {
      _this.validateSetup();

      return function (dispatch) {
        _this.setLoading(dispatch, true);

        _this.setError(dispatch, null);

        var url = _this.config.endPoint;
        sort = sort ? sort : _this.config.defaultSort; // console.warn("populate1",populate);

        populate = populate ? populate : _this.config.defaultPopulate;
        url += '?sort=' + sort;

        if (populate) {
          url += '&populate=' + populate; // console.warn("populate2",populate);
        }

        if (filter) {
          url += '&' + filter;
        }

        _jsLib.Http.get(url).then(function (response) {
          if (!Array.isArray(response) && response.data) response = response.data;
          response = response.map(function (item) {
            return _this.prepareToClient(item);
          });
          dispatch({
            type: _this.type('GET_OBJECTS'),
            payload: response
          });

          _this.setLoading(dispatch, false);
        }).catch(function (error) {
          _this.onUncaught(error);

          _this.setLoading(dispatch, false);
        });
      };
    });
    (0, _defineProperty2.default)(this, "getObject", function (id, populate) {
      return function (dispatch) {
        var url = _this.config.endPoint + id;

        if (populate !== false) {
          populate = populate ? populate : _this.config.defaultPopulate;
          url += '?populate=' + populate;
        }

        _this.setLoading(dispatch, true);

        _this.setError(dispatch, null);

        dispatch({
          type: _this.type('NEW_OBJECT'),
          payload: {}
        });

        _jsLib.Http.get(url).then(function (response) {
          dispatch({
            type: _this.type('GET_OBJECT'),
            payload: _this.prepareToClient(response)
          });

          _this.setLoading(dispatch, false);
        }).catch(function (error) {
          _this.onUncaught(error);

          _this.setLoading(dispatch, false);

          _this.setError(dispatch, error);
        });
      };
    });
    (0, _defineProperty2.default)(this, "saveObject", function (input) {
      // Validate config
      if (!_this.config.validateObject || typeof _this.config.validateObject !== "function") {
        console.error('Your config', config);
        throw new Error("Every action must have a validateObject function on config");
      }

      var error = _this._validateObject(input);

      if (error) return function (dispatch) {
        return {
          type: _this.type('VALID'),
          payload: {
            message: error
          }
        };
      }; // console.log('saveObject', input);

      if (input._id) {
        return _this.updateObject(input);
      } else {
        return _this.createObject(input);
      }
    });
    (0, _defineProperty2.default)(this, "newObject", function (dispatch) {
      return function (dispatch) {
        _this.setLoading(dispatch, false);

        _this.setError(dispatch, null);

        dispatch({
          type: _this.type('NEW_OBJECT'),
          payload: {}
        });
      };
    });
    (0, _defineProperty2.default)(this, "prepareForm", function (match, populate) {
      _this.validateSetup(); // console.log('match', match);


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
    });
    (0, _defineProperty2.default)(this, "createObject", function (input) {
      // console.log('createObject ' + input);
      var sufix = _this.config.createSufix || '';
      return function (dispatch) {
        input = _this.prepareToServer(input);

        _this.setLoading(dispatch, true);

        _this.setError(dispatch, null);

        _jsLib.Http.post(_this.config.endPoint + sufix, input).then(function (response) {
          dispatch({
            type: _this.type('CREATE_OBJECT'),
            payload: _this.prepareToClient(response)
          });
          dispatch({
            type: _this.type('SAVE_OBJECT'),
            payload: _this.prepareToClient(response)
          });

          _this.setLoading(dispatch, false);
        }).catch(function (error) {
          _this.onUncaught(error);

          _this.setLoading(dispatch, false);

          _this.setError(dispatch, error);
        });
      };
    });
    (0, _defineProperty2.default)(this, "updateObject", function (input) {
      // console.log('updateObject ', input);
      return function (dispatch) {
        var sufix = _this.config.updateSufix || '';
        input = _this.prepareToServer(input);

        _this.setLoading(dispatch, true);

        _this.setError(dispatch, null);

        _jsLib.Http.put(_this.config.endPoint + input._id + sufix, input).then(function (response) {
          dispatch({
            type: _this.type('UPDATE_OBJECT'),
            payload: _this.prepareToClient(response)
          });
          dispatch({
            type: _this.type('SAVE_OBJECT'),
            payload: _this.prepareToClient(response)
          });

          _this.setLoading(dispatch, false);
        }).catch(function (error) {
          _this.onUncaught(error);

          _this.setLoading(dispatch, false);

          _this.setError(dispatch, error);
        });
      };
    });
    (0, _defineProperty2.default)(this, "deleteObject", function (id) {
      return function (dispatch) {
        var sufix = _this.config.deleteSufix || '';

        _this.setError(dispatch, null);

        _jsLib.Http.delete(_this.config.endPoint + id + sufix).then(function () {
          dispatch({
            type: _this.type('DELETE_OBJECT'),
            payload: id
          });
        }).catch(function (error) {
          _this.onUncaught(error);

          _this.setError(dispatch, error);
        });
      };
    });
    (0, _defineProperty2.default)(this, "inputChanged", function (key, value) {
      return {
        type: _this.type('INPUT_CHANGED'),
        payload: {
          key: key,
          value: value
        }
      };
    });
    (0, _defineProperty2.default)(this, "validateObject", function (item) {
      var error = _this._validateObject(item);

      if (error) {
        return {
          type: _this.type('VALID'),
          payload: {
            message: error
          }
        };
      } else {
        return {
          type: _this.type('VALID'),
          payload: true
        };
      }
    });
    (0, _defineProperty2.default)(this, "_validateObject", function (item) {
      var error = null; // Run default validations based on schema
      // 1 - Required fields
      // 2 - Data types
      // 3 - Extra fields (warning in console(dev) and rollbar (prod))
      // run custom validate

      if (_this.config.validateObject) {
        error = _this.config.validateObject(item);
      }

      return error;
    });
    (0, _defineProperty2.default)(this, "prepareToServer", function (item) {
      // Remove server data
      // delete item['_id'];
      // Default removes
      delete item['created_at'];
      delete item['updated_at'];
      delete item['__v'];
      delete item['_virtual']; // Have a custom prepareToServer?

      if (_this.config.prepareToServer) {
        item = _this.config.prepareToServer(item);
      }

      return item;
    });
    (0, _defineProperty2.default)(this, "prepareToClient", function (item) {
      if (_this.config.prepareToClient) {
        item = _this.config.prepareToClient(item);
      }

      return item;
    });
    (0, _defineProperty2.default)(this, "test", function () {
      console.log('teste');
    });
    (0, _defineProperty2.default)(this, "type", function (action) {
      return _this.config.typePrefix + '_' + action;
    });
    (0, _defineProperty2.default)(this, "setLoading", function (dispatch, loading) {
      dispatch({
        type: _this.type('LOADING'),
        payload: loading
      });
    });
    (0, _defineProperty2.default)(this, "setError", function (dispatch, error) {
      dispatch({
        type: _this.type('ERROR'),
        payload: error
      });
    });
    (0, _defineProperty2.default)(this, "onUncaught", function (error) {
      if (AMActions.onUncaught) {
        AMActions.onUncaught(error);
      } else {
        console.warn("!!! onError not setted on AMCacheActions !!!");
        console.log(error);
      }

      console.error(error);
    });

    // Validate config
    if (!_config.validateObject || typeof _config.validateObject !== "function") {
      console.warn('Your config', _config);
      throw new Error("Every action must have a validateObject function on config");
    }

    if (!_config.typePrefix || !_config.endPoint || !_config.defaultSort || !_config.singularTitle || !_config.pluralTitle) {
      console.warn('Your config', _config);
      throw new Error("You must set your config! Please set at least: typePrefix, endPoint, defaultSort, singularTitle, pluralTitle");
    } // Save it here


    this.config = _config;
  }

  (0, _createClass2.default)(AMActions, null, [{
    key: "onUncaughtError",
    /// UncaughtError handlers
    value: function onUncaughtError(cbUncaughtError) {
      AMActions.onUncaught = cbUncaughtError;
    }
  }]);
  return AMActions;
}();

AMActions.callbacks = {};
AMActions.onUncaught = null;
var _default = AMActions;
exports.default = _default;