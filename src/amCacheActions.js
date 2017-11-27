import {Http} from '@app-masters/js-lib';
import AMCache from './cache';

class AMCacheActions {
    constructor(config) {
        // Validate config
        if (!config.validateObject || (typeof config.validateObject) !== "function") {
            console.log('Your config', config);
            throw new Error("Every action must have a validateObject function on config");
        }

        if (!config.typePrefix || !config.endPoint || !config.defaultSort || !config.singularTitle || !config.pluralTitle) {
            console.log('Your config', config);
            throw new Error("You must set your config! Please set at least: typePrefix, endPoint, defaultSort, singularTitle, pluralTitle");
        }

        if (!config.cacheStrategy || ['CacheOnline', 'CacheEmptyOnline','Cache','Online'].indexOf(config.cacheStrategy)<0) {
            console.warn(config.typePrefix + ' withou cacheStrategy defined. Using CacheOnline now');
            config.cacheStrategy = 'CacheOnline';
        }

        // Save it here
        this.config = config;
        this.syncRecords = [];
        this.syncRecordsCount = 0;
    }

    validateSetup = () => {
        if (AMCacheActions.onUncaught === null) {
            throw new Error("You must call AMActions.setup first. Please, read the readme at redux-lib.");
        }
    };

    //// GENERIC METHOS to work for all promisses and possibilities here

    // 1 - CacheOnline - Obter do cache, depois online
    // 2 - Cache - Obter do cache apenas
    // 3 - CacheEmptyOnline - Obter do cache, se não tiver cache, obter online
    // 4 - Online - Obter online apenas

    doSave = (cacheStrategy, alwaysReturn, promiseCache, promiseOnline) => {
        console.log("doSave", cacheStrategy);
        if (cacheStrategy === 'CacheOnline' || cacheStrategy === 'CacheEmptyOnline') {
            this.doSaveCacheOnline(alwaysReturn, promiseCache, promiseOnline);
        } else if (cacheStrategy === 'Cache') {
            this.doSaveCache(alwaysReturn, promiseCache);
        } else if (cacheStrategy === 'Online') {
            this.doSaveOnline(alwaysReturn, promiseOnline);
        }
    };

    // 1 - CacheOnline - Obter do cache, depois online
    doSaveCacheOnline = (alwaysReturn, promiseCache, promiseOnline) => {
        // console.log("doSaveCacheOnline");
        promiseCache().then(result => {
            // console.log('1result', result);
            alwaysReturn(result, true);
            promiseOnline().then(result => {
                // console.log('2result', result);
                alwaysReturn(result, false, true);
            });
        }).catch(err => {
            this.onUncaught(err);
        });
    };

    // 2 - Cache - Obter do cache apenas
    doSaveCache = (alwaysReturn, promiseCache) => {
        // console.log("doSaveCache");
        promiseCache().then(result => {
            alwaysReturn(result, true, true)
        }).catch(err => {
            this.onUncaught(err);
        });
    };

    // 4 - Online - Salvar online apenas
    doSaveOnline = (alwaysReturn, promiseOnline) => {
        // console.log("doSaveOnline");
        promiseOnline().then(result => {
            alwaysReturn(result, false, true)
        }).catch(err => {
            this.onUncaught(err);
        });
    };


    // 1 - CacheOnline - Obter do cache, depois online
    // 2 - Cache - Obter do cache apenas
    // 3 - CacheEmptyOnline - Obter do cache, se não tiver cache, obter online
    // 4 - Online - Obter online apenas

    doGet = (cacheStrategy, alwaysReturn, promiseOnline, promiseCache) => {
        this.validateSetup();
        // console.log("doGet", cacheStrategy);
        if (cacheStrategy === 'CacheOnline') {
            this.doGetCacheOnline(alwaysReturn, promiseOnline, promiseCache);
        } else if (cacheStrategy === 'Cache') {
            this.doGetCache(alwaysReturn, promiseCache);
        } else if (cacheStrategy === 'CacheEmptyOnline') {
            this.doGetCacheEmptyOnline(alwaysReturn, promiseOnline, promiseCache);
        } else if (cacheStrategy === 'Online') {
            this.doGetOnline(alwaysReturn, promiseOnline);
        }

        // doIfCache(sempreRetornar, promessaCacheInativo, promessaCacheAtivo);
        //
    };

// 1 - CacheOnline - Obter do cache, depois online
    doGetCacheOnline = (alwaysReturn, promiseOnline, promiseCache) => {
        this.validateSetup();
        // console.log("doGetCacheOnline");
        promiseCache().then(result => {
            // console.log('promiseCache result', result);
            if (result && result.length > 0) {
                // result.pop(); //
                // result.shift(); //
            }
            alwaysReturn(result, true, false);
            // setTimeout(() => {
            promiseOnline().then(result => {
                alwaysReturn(result, false, true)
            })
            // }, 3000);
        }).catch(err => {
            this.onUncaught(err);
        });
    };

    doGetCache = (alwaysReturn, promiseCache) => {
        this.validateSetup();
        // console.log("doGetCache");
        promiseCache().then(result => {
            console.log('promiseCache result', result);

            // count fake records
            this.syncRecords = [];
            let fakesCount = result.reduce((count, record) => {
                // console.log(record);
                // console.log(record._id);
                if (record && record._id && record._id.indexOf("fake") > -1) {
                    this.syncRecords.push(record);
                    return count + 1;
                } else
                    return count;
            }, 0);
            // console.log("fakesCount", fakesCount);
            this.syncRecordsCount = fakesCount;

            alwaysReturn(result, true, true);
        }).catch(err => {
            this.onUncaught(err);
        });
    };
    doGetCacheEmptyOnline = (alwaysReturn, promiseOnline, promiseCache) => {
        this.validateSetup();
        // console.log("doGetCacheEmptyOnline");
        promiseCache().then(result => {
            // console.log('promiseCache result', result);
            // result = null; //
            alwaysReturn(result, true, false);
            if (!result || result.length === 0) {
                // setTimeout(() => {
                promiseOnline().then(result => {
                    alwaysReturn(result, false, true)
                });
                // }, 1000);
            }
        }).catch(err => {
            this.onUncaught(err);
        });
    };
    doGetOnline = (alwaysReturn, promiseOnline) => {
        this.validateSetup();
        // console.log("doGetOnline");
        promiseOnline().then(result => {
            alwaysReturn(result, false, true)
        }).catch(err => {
            this.onUncaught(err);
        });
    };


    // cache ok
    getObjects = (sort, populate, filter) => {
        return (dispatch) => {
            try {
                this.setLoading(dispatch, true, this.config.cacheStrategy !== 'Online', this.config.cacheStrategy !== 'Cache');
                this.setError(dispatch, null);

                //console.log("ok");
                // Everymotherfuckercase
                let sempreRetornar = (response, fromCache, final) => {
                    if (final === true)
                        this.setLoading(dispatch, false, false, false);
                    else if (fromCache === true)
                        this.setLoadingFrom(dispatch, 'CACHE', false);
                    else if (fromCache === false)
                        this.setLoadingFrom(dispatch, 'ONLINE', false);
                    else
                        console.log('from where??');

                    // console.log("getObjects.sempreRetornar");
                    this.dispatchGetObjects(dispatch, response, fromCache, filter);
                };
                let promessaCache = () => {
                    // console.log("getObjects.promessaCache");
                    this.setLoadingFrom(dispatch, 'CACHE', true);
                    return AMCache.getObjects(this.config.typePrefix);
                };
                let promessaOnline = () => {
                    // console.log("getObjects.promessaOnline");
                    this.setLoadingFrom(dispatch, 'ONLINE', true);
                    return this._getObjects(sort, populate, filter);
                };

                this.doGet(this.config.cacheStrategy, sempreRetornar, promessaOnline, promessaCache);
            } catch (err) {
                this.onUncaught(err);
            }
        };
    };

    dispatchGetObjects(dispatch, response, fromCache, filter) {
        // console.log('fromCache',fromCache);
        // console.log('filter',filter);
        if (Object.prototype.toString.call(response) === '[object Array]')
            response = response.map(item => this.prepareToClient(item));
        else
            response = []; //
        // When Online, always use API data
        if (this.config.cacheStrategy === 'Online') {
            // console.log('dispatchGetObjects', 'Online');
            dispatch({type: this.type('GET_OBJECTS'), payload: response});
            // this.setLoading(dispatch, false);
        } else {
            // console.log('dispatchGetObjects', 'else');

            // When using cache, always SHOW cache data, even when getting from API first
            let replaceAll = fromCache === false && !filter;
            // let replaceAll = true;
            AMCache.addObjects(this.config.typePrefix, response, replaceAll).then(response => {
                dispatch({type: this.type('GET_OBJECTS'), payload: response});
                // this.setLoading(dispatch, false);
            });
        }
    }

    _getObjects(sort, populate, filter) {
        let url = this.config.endPoint;
        sort = (sort ? sort : this.config.defaultSort);
        populate = (populate ? populate : this.config.defaultPopulate);
        url += '?sort=' + sort;
        if (populate) {
            url += '&populate=' + populate;
        }
        if (filter)
            url += '&' + filter;
        return Http.get(url);
    }

    /* GET OBJECTS */

    getObject = (id, populate) => {
        return (dispatch) => {
            try {
                this.setLoading(dispatch, true, this.config.cacheStrategy !== 'Online', this.config.cacheStrategy !== 'Cache');
                this.setError(dispatch, null);
                dispatch({type: this.type('NEW_OBJECT'), payload: {}});

                // Everymotherfuckercase
                let sempreRetornar = (response, fromCache, final) => {
                    if (final === true)
                        this.setLoading(dispatch, false, false, false);
                    else if (fromCache === true)
                        this.setLoadingFrom(dispatch, 'CACHE', false);
                    else if (fromCache === false)
                        this.setLoadingFrom(dispatch, 'ONLINE', false);
                    else
                        console.log('from where??');

                    //console.log("getObject.sempreRetornar");
                    this.dispatchGetObject(dispatch, response, fromCache);
                };
                let promessaCacheAtivo = () => {
                    // console.log("getObject.promessaCacheAtivo");
                    this.setLoadingFrom(dispatch, 'CACHE', true);
                    return AMCache.getObject(this.config.typePrefix, id);
                };
                let promessaCacheInativo = () => {
                    // console.log("getObject.promessaCacheInativo");
                    this.setLoadingFrom(dispatch, 'ONLINE', true);
                    return this._getObject(id, populate);
                };

                this.doGet(this.config.cacheStrategy, sempreRetornar, promessaCacheInativo, promessaCacheAtivo);
            } catch (err) {
                this.onUncaught(err);
            }
        };

    };

    _getObject(id, populate) {
        let url = this.config.endPoint + id;
        if (populate !== false) {
            populate = (populate ? populate : this.config.defaultPopulate);
            url += '?populate=' + populate;
        }
        return Http.get(url);
    }

    dispatchGetObject(dispatch, response, fromCache) {
        // console.log('aa',Object.prototype.toString.call(response));
        if (Object.prototype.toString.call(response) === '[object Object]')
            response = this.prepareToClient(response);
        else
            response = {};
        if (this.config.cacheStrategy === 'Online') {
            // console.log('dispatchGetObject', 'Online');
            dispatch({type: this.type('GET_OBJECT'), payload: response});
            this.setLoading(dispatch, false);
        }
        else {
            AMCache.addObjects(this.config.typePrefix, [response]);
            dispatch({type: this.type('GET_OBJECT'), payload: response});
            // console.log('dispatch', response);
            this.setLoading(dispatch, false);
        }
    }


    saveObject = (input) => {
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
            this.setLoading(dispatch, false, false, false);
            this.setError(dispatch, null);
            dispatch({type: this.type('NEW_OBJECT'), payload: {}});
        };
    };

    prepareForm = (match) => {
        // console.log('match', match);
        if (match && match.params.id !== 'new') {
            // Editing
            // TODO: Corrigir o get object para não popular formulários complexos
            return this.getObject(match.params.id, false);
        } else {
            // Inserting
            return this.newObject();
        }
    };

    createObject = (input) => {

        // console.log('createObject ' + input);
        return (dispatch) => {

            try {
                input = this.prepareToServer(input);

                this.setLoading(dispatch, true, this.config.cacheStrategy !== 'Online', this.config.cacheStrategy !== 'Cache');
                this.setError(dispatch, null);

                // Everymotherfuckercase
                let sempreRetornar = (response, fromCache, final) => {
                    if (final === true)
                        this.setLoading(dispatch, false, false, false);
                    else if (fromCache === true)
                        this.setLoadingFrom(dispatch, 'CACHE', false);
                    else if (fromCache === false)
                        this.setLoadingFrom(dispatch, 'ONLINE', false);
                    else
                        console.log('from where??');



                    // console.log("createObject.sempreRetornar", response);
                    this.dispatchSaveObject(dispatch, response, 'CREATE_OBJECT');
                };
                let promessaCache = () => {
                    // console.log("createObject.promessaCache", input);
                    this.setLoadingFrom(dispatch, 'CACHE', true);
                    return AMCache.addObjects(this.config.typePrefix, [input]);
                };
                let promessaOnline = () => {
                    // console.log("createObject.promessaOnline", input);
                    this.setLoadingFrom(dispatch, 'ONLINE', true);
                    delete input['_id'];
                    return this._createObject(input);
                };

                this.doSave(this.config.cacheStrategy, sempreRetornar, promessaCache, promessaOnline);
            } catch (err) {
                this.onUncaught(err);
            }
        };
    };

    _createObject = (input) => {
        return Http.post(this.config.endPoint, input);
    };

    /* UPDATE */

    updateObject = (input) => {
        // console.log('updateObject ' + input);
        return (dispatch) => {

            try {
                let id = input._id;
                input = this.prepareToServer(input);

                this.setLoading(dispatch, true, this.config.cacheStrategy !== 'Online', this.config.cacheStrategy !== 'Cache');
                this.setError(dispatch, null);

                // Everymotherfuckercase
                let sempreRetornar = (response, fromCache, final) => {
                    if (final === true)
                        this.setLoading(dispatch, false, false, false);
                    else if (fromCache === true)
                        this.setLoadingFrom(dispatch, 'CACHE', false);
                    else if (fromCache === false)
                        this.setLoadingFrom(dispatch, 'ONLINE', false);
                    else
                        console.log('from where??');

                    // console.log("updateObject.sempreRetornar");
                    this.dispatchSaveObject(dispatch, response, 'UPDATE_OBJECT');
                };
                let promessaCache = () => {
                    // console.log("updateObject.promessaCache", input);
                    this.setLoadingFrom(dispatch, 'CACHE', true);
                    return AMCache.addObjects(this.config.typePrefix, [input]);
                };
                let promessaOnline = () => {
                    // console.log("pupdateObject.romessaOnline");
                    delete input['_id'];
                    this.setLoadingFrom(dispatch, 'ONLINE', true);
                    return this._updateObject(id, input);
                };

                this.doSave(this.config.cacheStrategy, sempreRetornar, promessaCache, promessaOnline);
            } catch (err) {
                this.onUncaught(err);
            }
        };
    };

    _updateObject(id, input) {
        return Http.put(this.config.endPoint + id, input);
    }

    dispatchSaveObject(dispatch, response, secondaryAction) {
        dispatch({type: this.type(secondaryAction), payload: this.prepareToClient(response)}); // broadcast
        dispatch({type: this.type('SAVE_OBJECT'), payload: this.prepareToClient(response)});
        this.setLoading(dispatch, false);
    }

    /* DELETE */

    deleteObject = (id) => {
        return (dispatch) => {

            try {
                this.setLoading(dispatch, true, this.config.cacheStrategy !== 'Online', this.config.cacheStrategy !== 'Cache');
                this.setError(dispatch, null);

                // Everymotherfuckercase
                let sempreRetornar = (response, fromCache, final) => {
                    if (final === true)
                        this.setLoading(dispatch, false, false, false);
                    else if (fromCache === true)
                        this.setLoadingFrom(dispatch, 'CACHE', false);
                    else if (fromCache === false)
                        this.setLoadingFrom(dispatch, 'ONLINE', false);
                    else
                        console.log('from where??');

                    // console.log("updateObject.sempreRetornar");
                    this._dispatchDeleteObject(dispatch, id);
                };
                let promessaCache = () => {
                    // console.log("updateObject.promessaCache");
                    this.setLoadingFrom(dispatch, 'CACHE', true);
                    return AMCache.delObjects(this.config.typePrefix, [id]);
                };
                let promessaOnline = () => {
                    // console.log("pupdateObject.romessaOnline");
                    this.setLoadingFrom(dispatch, 'ONLINE', true);
                    return this._deleteObject(id);
                };

                this.doSave(this.config.cacheStrategy, sempreRetornar, promessaCache, promessaOnline);
            } catch (error) {
                this.onUncaught(err);
                this.setError(dispatch, error);
            }
        };
    };

    deleteSyncData = () => {
        return (dispatch) => {

            try {
                this.setLoading(dispatch, true, this.config.cacheStrategy !== 'Online', this.config.cacheStrategy !== 'Cache');
                this.setError(dispatch, null);

                // Get fake ids
                let syncRecords = this.getSyncData();
                let ids = [];
                for (let record of syncRecords) {
                    console.log(record);
                    ids.push(record._id);
                }
                console.log(ids);

                // Everymotherfuckercase
                let sempreRetornar = (response, fromCache, final) => {
                    if (final === true)
                        this.setLoading(dispatch, false, false, false);
                    else if (fromCache === true)
                        this.setLoadingFrom(dispatch, 'CACHE', false);
                    else if (fromCache === false)
                        this.setLoadingFrom(dispatch, 'ONLINE', false);
                    else
                        console.log('from where??');

                    this.syncRecords = [];
                    this.syncRecordsCount = 0;

                    // console.log("updateObject.sempreRetornar");
                    this._dispatchDeleteObject(dispatch, ids);
                };
                let promessaCache = () => {
                    // console.log("updateObject.promessaCache");
                    this.setLoadingFrom(dispatch, 'CACHE', true);
                    return AMCache.delObjects(this.config.typePrefix, ids);
                };

                this.doSave(this.config.cacheStrategy, sempreRetornar, promessaCache, null);
            } catch (error) {
                this.onUncaught(err);
                this.setError(dispatch, error);
            }
        };
    };

    _deleteObject(id) {
        return Http.delete(this.config.endPoint + id);
    }

    _dispatchDeleteObject(dispatch, id) {
        console.log("constructorName", id.constructor.name);
        if (id.constructor.name === "Array") {
            id.map(oId => {
                dispatch({type: this.type('DELETE_OBJECT'), payload: oId});
            });
        } else {
            dispatch({type: this.type('DELETE_OBJECT'), payload: id});
        }

    }

    /* OTHER ACTIONS */

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

    type = (action) => {
        return this.config.typePrefix + '_' + action;
    };

    setLoading = (dispatch, loading, loadingCache, loadingOnline) => {
        // console.log('setLoading loadingCache', loadingCache);
        // console.log('setLoading loadingOnline', loadingOnline);
        dispatch({type: this.type('LOADING'), payload: loading});
        if (loadingCache !== undefined)
            dispatch({type: this.type('LOADING_CACHE'), payload: loadingCache});
        if (loadingOnline !== undefined)
            dispatch({type: this.type('LOADING_ONLINE'), payload: loadingOnline});
    };

    setLoadingFrom = (dispatch, from, loading) => {
        // console.log("setLoadingFrom " + from, loading);
        dispatch({type: this.type('LOADING_' + from), payload: loading});
    };

    setError = (dispatch, error) => {
        dispatch({type: this.type('ERROR'), payload: error});
    };


    hasSyncData = () => {
        return this.getCountSyncData() > 0;
    };

    getCountSyncData = () => {
        return this.syncRecordsCount;
    };

    getSyncData = () => {
        return this.syncRecords;
    }

    // clearSyncData = async () => {
    //     let syncRecords = this.getSyncData();
    //     let ids = [];
    //     for (let record of syncRecords) {
    //         console.log(record);
    //         ids.push(record._id);
    //     }
    //     console.log(ids);
    //     let ok = await AMCache.delObjects(this.config.typePrefix, ids);
    //     console.log(ok);
    // }

    /// UncaughtError handlers

    static onUncaughtError(cbUncaughtError) {
        AMCacheActions.onUncaught = cbUncaughtError;
    }

    onUncaught = (error) => {
        if (AMCacheActions.onUncaught) {
            AMCacheActions.onUncaught(error);
        } else {
            console.warn("!!! onError not setted on AMActions !!!");
            console.log(error);
        }
        console.error(error);
    }

}

AMCacheActions.onUncaught = null;

export default AMCacheActions;
