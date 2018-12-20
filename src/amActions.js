import {Http} from '@app-masters/js-lib';
import AMCacheActions from "./amCacheActions";
import AMCache from "./cache";

class AMActions {
    static setup(storage, callback) {
        // Validate
        if (!callback || !callback.onUncaughtError) throw "You must pass callback parameter to AMActions.setup, with onUncaughtError methods.";

        // Set it here
        AMCache.setStorage(storage);
        AMActions.callbacks = callback;
        AMActions.onUncaughtError(callback.onUncaughtError);
        AMCacheActions.onUncaughtError(callback.onUncaughtError);
    }


    constructor(config) {
        // Validate config
        if (!config.validateObject || (typeof config.validateObject) !== "function") {
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

    validateSetup = () => {
        if (AMActions.onUncaught === null) {
            throw new Error("You must call AMActions.setup first. Please, read the readme at redux-lib.");
        }
    };

    getObjects = (sort, populate, filter) => {
        this.validateSetup();
        return (dispatch) => {
            this.setLoading(dispatch, true);
            this.setError(dispatch, null);
            let url = this.config.endPoint;
            sort = (sort ? sort : this.config.defaultSort);
            // console.warn("populate1",populate);
            populate = (populate ? populate : this.config.defaultPopulate);
            url += '?sort=' + sort;
            if (populate) {
                url += '&populate=' + populate;
                // console.warn("populate2",populate);
            }
            if (filter) {
                url += '&' + filter;
            }
            Http.get(url)
                .then(response => {
                    if(!this.config.nestedKey){
                        const keys = Object.keys(response);
                        if(!Array.isArray(response) && response.data && keys.length === 1 && keys[0] === 'data') {
                            response = response.data;
                        }
                    } else {
                        response = response[this.config.nestedKey]
                    }
                    response = response.map(item => this.prepareToClient(item));
                    dispatch({type: this.type('GET_OBJECTS'), payload: response});
                    this.setLoading(dispatch, false);
                    }
                )
                .catch(error => {
                    this.onUncaught(error);
                    this.setLoading(dispatch, false);
                });
        };
    };

    getObject = (id, populate) => {
        return (dispatch) => {
            let {endPoint} = this.config;
            if(endPoint.slice(-1) !== '/') endPoint = endPoint + '/'
            let url = endPoint + id;
            if (populate !== false) {
                populate = (populate ? populate : this.config.defaultPopulate);
                url += '?populate=' + populate;
            }
            this.setLoading(dispatch, true);
            this.setError(dispatch, null);
            dispatch({type: this.type('NEW_OBJECT'), payload: {}});
            Http.get(url)
                .then(response => {
                    if(!this.config.nestedKey){
                        const keys = Object.keys(response);
                        if(response.data && keys.length === 1 && keys[0] === 'data') response = response.data;
                    } else {
                        response = response[this.config.nestedKey]
                    }
                    dispatch({type: this.type('GET_OBJECT'), payload: this.prepareToClient(response)});
                    this.setLoading(dispatch, false);
                })
                .catch(error => {
                    this.onUncaught(error);
                    this.setLoading(dispatch, false);
                    this.setError(dispatch, error);
                });
        };
    };

    saveObject = (input) => {
        // Validate config
        if (!this.config.validateObject || (typeof this.config.validateObject) !== "function") {
            console.error('Your config', config);
            throw new Error("Every action must have a validateObject function on config");
        }

        let error = this._validateObject(input);
        if (error)
            return (dispatch) => {
                return {type: this.type('VALID'), payload: {message: error}};
            };

        // console.log('saveObject', input);
        if (input._id) {
            return this.updateObject(input);
        } else {
            return this.createObject(input);
        }
    };

    newObject = (dispatch) => {
        return (dispatch) => {
            this.setLoading(dispatch, false);
            this.setError(dispatch, null);
            dispatch({type: this.type('NEW_OBJECT'), payload: {}});
        };
    };

    prepareForm = (match, populate) => {
        this.validateSetup();
        // console.log('match', match);
        if (match && match.params.id !== 'new') {
            // Editing
            // TODO: Corrigir o get object para não popular formulários complexos
            // Forcing populate when giving param
            populate = (populate) ? populate : false;
            return this.getObject(match.params.id, populate);
        } else {
            // Inserting
            return this.newObject();
        }
    };

    createObject = (input) => {
        // console.log('createObject ' + input);
        const sufix = this.config.createSufix || '';

        return (dispatch) => {
            input = this.prepareToServer(input);
            this.setLoading(dispatch, true);
            this.setError(dispatch, null);
            Http.post(this.config.endPoint + sufix, input)
                .then(response => {
                    if(this.config.nestedKey){
                        response = response[this.config.nestedKey]
                    }
                    dispatch({type: this.type('CREATE_OBJECT'), payload: this.prepareToClient(response)});
                    dispatch({type: this.type('SAVE_OBJECT'), payload: this.prepareToClient(response)});
                    this.setLoading(dispatch, false);
                })
                .catch(error => {
                    this.onUncaught(error);
                    this.setLoading(dispatch, false);
                    this.setError(dispatch, error);
                });
        };
    };

    updateObject = (input) => {
        // console.log('updateObject ', input);
        return (dispatch) => {
            const sufix = this.config.updateSufix || '';
            input = this.prepareToServer(input);
            let id;
            if('_id' in input) {
                id = input._id;
            } else {
                id = input.id;
                delete input.id;
            }
            this.setLoading(dispatch, true);
            this.setError(dispatch, null);
            let {endPoint} = this.config;
            if(endPoint.slice(-1) !== '/') endPoint = endPoint + '/'
            Http.put(endPoint + id + sufix, input)
                .then(response => {
                    if(this.config.nestedKey){
                        response = response[this.config.nestedKey]
                    }
                    dispatch({type: this.type('UPDATE_OBJECT'), payload: this.prepareToClient(response)});
                    dispatch({type: this.type('SAVE_OBJECT'), payload: this.prepareToClient(response)});
                    this.setLoading(dispatch, false);
                })
                .catch(error => {
                    this.onUncaught(error);
                    this.setLoading(dispatch, false);
                    this.setError(dispatch, error);
                });
        };
    };

    deleteObject = (id) => {
        return (dispatch) => {
            const sufix = this.config.deleteSufix || '';
            let {endPoint} = this.config;
            if(endPoint.slice(-1) !== '/') endPoint = endPoint + '/'
            this.setError(dispatch, null);
            Http.delete(endPoint + id + sufix)
                .then(() => {
                    dispatch({type: this.type('DELETE_OBJECT'), payload: id});
                })
                .catch(error => {
                    this.onUncaught(error);
                    this.setError(dispatch, error);
                });
        };
    };

    inputChanged = (key, value) => {
        return {type: this.type('INPUT_CHANGED'), payload: {key, value}};
    };

    validateObject = (item) => {
        let error = this._validateObject(item);
        if (error) {
            return {type: this.type('VALID'), payload: {message: error}};
        } else {
            return {type: this.type('VALID'), payload: true};
        }
    };

    _validateObject = (item) => {
        let error = null;
        // Run default validations based on schema
        // 1 - Required fields
        // 2 - Data types
        // 3 - Extra fields (warning in console(dev) and rollbar (prod))

        // run custom validate
        if (this.config.validateObject) {
            error = this.config.validateObject(item);
        }

        return error;
    };

    // Change object to fit server requirements
    prepareToServer = (item) => {
        // Remove server data
        // delete item['_id'];
        // Default removes
        delete item['created_at'];
        delete item['updated_at'];
        delete item['__v'];
        delete item['_virtual'];

        // Have a custom prepareToServer?
        if (this.config.prepareToServer) {
            item = this.config.prepareToServer(item);
        }

        return item;
    };

    // Change object to fit client needs
    prepareToClient = (item) => {
        if (this.config.prepareToClient) {
            item = this.config.prepareToClient(item);
        }

        return item;
    };

    // Private methods

    test = () => {
        console.log('teste');
    };

    type = (action) => {
        return this.config.typePrefix + '_' + action;
    };

    setLoading = (dispatch, loading) => {
        dispatch({type: this.type('LOADING'), payload: loading});
    };

    setError = (dispatch, error) => {
        dispatch({type: this.type('ERROR'), payload: error});
    };

    /// UncaughtError handlers

    static onUncaughtError(cbUncaughtError) {
        AMActions.onUncaught = cbUncaughtError;
    }

    onUncaught = (error) => {
        if (AMActions.onUncaught) {
            AMActions.onUncaught(error);
        } else {
            console.warn("!!! onError not setted on AMCacheActions !!!");
            console.log(error);
        }
        console.error(error);
    }
}

AMActions.callbacks = {};
AMActions.onUncaught = null;

export default AMActions;
