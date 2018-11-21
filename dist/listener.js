"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _emitter = _interopRequireDefault(require("./emitter"));

var _default = {
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
    _emitter.default.handleAction(action, dispatched, store);
  }
};
exports.default = _default;