import {Http} from '@app-masters/js-lib';

class AMActions {
    constructor(config) {
        // console.log('constructor', config.typePrefix);
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


    getObjects = (sort, populate, filter) => {
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
            if (filter){
                url += '&'+filter;
            }
            Http.get(url)
                .then(response => {
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
            let url = this.config.endPoint + id;
            if (populate !== false) {
                populate = (populate ? populate : this.config.defaultPopulate);
                url += '?populate=' + populate;
            }
            this.setLoading(dispatch, true);
            this.setError(dispatch, null);
            dispatch({type: this.type('NEW_OBJECT'), payload: {}});
            Http.get(url)
                .then(response => {
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

    newObject = (dispatch)=> {
        return (dispatch) => {
            this.setLoading(dispatch, false);
            this.setError(dispatch, null);
            dispatch({type: this.type('NEW_OBJECT'), payload: {}});
        };
    };

    prepareForm = (match, populate) => {
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
        return (dispatch) => {
            input = this.prepareToServer(input);
            this.setLoading(dispatch, true);
            this.setError(dispatch, null);
            Http.post(this.config.endPoint, input)
                .then(response => {
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
            input = this.prepareToServer(input);
            this.setLoading(dispatch, true);
            this.setError(dispatch, null);
            Http.put(this.config.endPoint + input._id, input)
                .then(response => {
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
            this.setError(dispatch, null);
            Http.delete(this.config.endPoint + id)
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

    type = (action)=> {
        return this.config.typePrefix + '_' + action;
    };

    setLoading = (dispatch, loading)=> {
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
        if (AMActions.onUncaught){
            AMActions.onUncaught(error);
        } else {
            console.warn("!!! onError not setted on AMCacheActions !!!");
            console.log(error);
        }
        console.error(error);
    }
}

export default AMActions;
