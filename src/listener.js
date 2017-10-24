import ActionEmitter from './emitter';

export default {

    // types can be an array of action types, or the string 'all'
    types: ['all'],

    // setStore (optional)
    // in case you want a reference to store in your listener object
    setStore (store) {
        this.store = store;
    },

    // handleAction is called when an action from types is dispatched
    handleAction (action, dispatched, store) {
        // console.log('handleAction action', action);
        // console.log('handleAction dispatched', dispatched);
        // console.log('handleAction store', store);
        ActionEmitter.handleAction(action, dispatched, store);
    }
};
