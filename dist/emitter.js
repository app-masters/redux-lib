'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ActionEmitter = function (_EventEmitter) {
    (0, _inherits3.default)(ActionEmitter, _EventEmitter);

    function ActionEmitter() {
        var _ref;

        (0, _classCallCheck3.default)(this, ActionEmitter);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var _this = (0, _possibleConstructorReturn3.default)(this, (_ref = ActionEmitter.__proto__ || Object.getPrototypeOf(ActionEmitter)).call.apply(_ref, [this].concat(args)));

        _this.types = 'all';
        return _this;
    }

    (0, _createClass3.default)(ActionEmitter, [{
        key: 'handleAction',
        value: function handleAction(action, dispatched, store) {
            this.emit(action.type, action, store);
            return dispatched;
        }
    }]);
    return ActionEmitter;
}(_events2.default);

exports.default = ActionEmitter;