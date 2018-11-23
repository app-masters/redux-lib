"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf3 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _events = _interopRequireDefault(require("events"));

var ActionEmitter =
/*#__PURE__*/
function (_EventEmitter) {
  (0, _inherits2.default)(ActionEmitter, _EventEmitter);

  function ActionEmitter() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2.default)(this, ActionEmitter);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2.default)(this, (_getPrototypeOf2 = (0, _getPrototypeOf3.default)(ActionEmitter)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _this.types = 'all';
    return _this;
  }

  (0, _createClass2.default)(ActionEmitter, [{
    key: "handleAction",
    value: function handleAction(action, dispatched, store) {
      this.emit(action.type, action, store);
      return dispatched;
    }
  }]);
  return ActionEmitter;
}(_events.default);

exports.default = ActionEmitter;