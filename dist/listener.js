'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _emitter = require('./emitter');

var _emitter2 = _interopRequireDefault(_emitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

    // types can be an array of action types, or the string 'all'
    types: ['all'],

    // setStore (optional)
    // in case you want a reference to store in your listener object
    setStore: function setStore(store) {
        this.store = store;
    },


    // handleAction is called when an action from types is dispatched
    handleAction: function handleAction(action, dispatched, store) {
        // console.log('handleAction action', action);
        // console.log('handleAction dispatched', dispatched);
        // console.log('handleAction store', store);
        _emitter2.default.handleAction(action, dispatched, store);
    }
};