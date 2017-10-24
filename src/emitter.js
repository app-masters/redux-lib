import EventEmitter from 'events';

export default class ActionEmitter extends EventEmitter {
    constructor (...args) {
        super(...args);
        this.types = 'all';
    }

    handleAction (action, dispatched, store) {
        this.emit(action.type, action, store);
        return dispatched;
    }
}
