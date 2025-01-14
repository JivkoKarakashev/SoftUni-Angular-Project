(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('http'), require('fs'), require('crypto')) :
        typeof define === 'function' && define.amd ? define(['http', 'fs', 'crypto'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Server = factory(global.http, global.fs, global.crypto));
}(this, (function (http, fs, crypto) {
    'use strict';

    function _interopDefaultLegacy(e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
    var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
    var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

    class ServiceError extends Error {
        constructor(message = 'Service Error') {
            super(message);
            this.name = 'ServiceError';
        }
    }

    class NotFoundError extends ServiceError {
        constructor(message = 'Resource not found') {
            super(message);
            this.name = 'NotFoundError';
            this.status = 404;
        }
    }

    class RequestError extends ServiceError {
        constructor(message = 'Request error') {
            super(message);
            this.name = 'RequestError';
            this.status = 400;
        }
    }

    class ConflictError extends ServiceError {
        constructor(message = 'Resource conflict') {
            super(message);
            this.name = 'ConflictError';
            this.status = 409;
        }
    }

    class AuthorizationError extends ServiceError {
        constructor(message = 'Unauthorized') {
            super(message);
            this.name = 'AuthorizationError';
            this.status = 401;
        }
    }

    class CredentialError extends ServiceError {
        constructor(message = 'Forbidden') {
            super(message);
            this.name = 'CredentialError';
            this.status = 403;
        }
    }

    var errors = {
        ServiceError,
        NotFoundError,
        RequestError,
        ConflictError,
        AuthorizationError,
        CredentialError
    };

    const { ServiceError: ServiceError$1 } = errors;


    function createHandler(plugins, services) {
        return async function handler(req, res) {
            const method = req.method;
            console.info(`<< ${req.method} ${req.url}`);

            // Redirect fix for admin panel relative paths
            if (req.url.slice(-6) == '/admin') {
                res.writeHead(302, {
                    'Location': `http://${req.headers.host}/admin/`
                });
                return res.end();
            }

            let status = 200;
            let headers = {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            };
            let result = '';
            let context;

            // NOTE: the OPTIONS method results in undefined result and also it never processes plugins - keep this in mind
            if (method == 'OPTIONS') {
                Object.assign(headers, {
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Credentials': false,
                    'Access-Control-Max-Age': '86400',
                    'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-Authorization, X-Admin'
                });
            } else {
                try {
                    context = processPlugins();
                    await handle(context);
                } catch (err) {
                    if (err instanceof ServiceError$1) {
                        status = err.status || 400;
                        result = composeErrorObject(err.code || status, err.message);
                    } else {
                        // Unhandled exception, this is due to an error in the service code - REST consumers should never have to encounter this;
                        // If it happens, it must be debugged in a future version of the server
                        console.error(err);
                        status = 500;
                        result = composeErrorObject(500, 'Server Error');
                    }
                }
            }

            res.writeHead(status, headers);
            if (context != undefined && context.util != undefined && context.util.throttle) {
                await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
            }
            res.end(result);

            function processPlugins() {
                const context = { params: {} };
                plugins.forEach(decorate => decorate(context, req));
                return context;
            }

            async function handle(context) {
                const { serviceName, tokens, query, body } = await parseRequest(req);
                if (serviceName == 'admin') {
                    return ({ headers, result } = services['admin'](method, tokens, query, body));
                } else if (serviceName == 'favicon.ico') {
                    return ({ headers, result } = services['favicon'](method, tokens, query, body));
                }

                const service = services[serviceName];

                if (service === undefined) {
                    status = 400;
                    result = composeErrorObject(400, `Service "${serviceName}" is not supported`);
                    console.error('Missing service ' + serviceName);
                } else {
                    result = await service(context, { method, tokens, query, body });
                }

                // NOTE: logout does not return a result
                // in this case the content type header should be omitted, to allow checks on the client
                if (result !== undefined) {
                    result = JSON.stringify(result);
                } else {
                    status = 204;
                    delete headers['Content-Type'];
                }
            }
        };
    }



    function composeErrorObject(code, message) {
        return JSON.stringify({
            code,
            message
        });
    }

    async function parseRequest(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const tokens = url.pathname.split('/').filter(x => x.length > 0);
        const serviceName = tokens.shift();
        const queryString = url.search.split('?')[1] || '';
        const query = queryString
            .split('&')
            .filter(s => s != '')
            .map(x => x.split('='))
            .reduce((p, [k, v]) => Object.assign(p, { [k]: decodeURIComponent(v) }), {});
        const body = await parseBody(req);

        return {
            serviceName,
            tokens,
            query,
            body
        };
    }

    function parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => body += chunk.toString());
            req.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (err) {
                    resolve(body);
                }
            });
        });
    }

    var requestHandler = createHandler;

    class Service {
        constructor() {
            this._actions = [];
            this.parseRequest = this.parseRequest.bind(this);
        }

        /**
         * Handle service request, after it has been processed by a request handler
         * @param {*} context Execution context, contains result of middleware processing
         * @param {{method: string, tokens: string[], query: *, body: *}} request Request parameters
         */
        async parseRequest(context, request) {
            for (let { method, name, handler } of this._actions) {
                if (method === request.method && matchAndAssignParams(context, request.tokens[0], name)) {
                    return await handler(context, request.tokens.slice(1), request.query, request.body);
                }
            }
        }

        /**
         * Register service action
         * @param {string} method HTTP method
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        registerAction(method, name, handler) {
            this._actions.push({ method, name, handler });
        }

        /**
         * Register GET action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        get(name, handler) {
            this.registerAction('GET', name, handler);
        }

        /**
         * Register POST action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        post(name, handler) {
            this.registerAction('POST', name, handler);
        }

        /**
         * Register PUT action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        put(name, handler) {
            this.registerAction('PUT', name, handler);
        }

        /**
         * Register PATCH action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        patch(name, handler) {
            this.registerAction('PATCH', name, handler);
        }

        /**
         * Register DELETE action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        delete(name, handler) {
            this.registerAction('DELETE', name, handler);
        }
    }

    function matchAndAssignParams(context, name, pattern) {
        if (pattern == '*') {
            return true;
        } else if (pattern[0] == ':') {
            context.params[pattern.slice(1)] = name;
            return true;
        } else if (name == pattern) {
            return true;
        } else {
            return false;
        }
    }

    var Service_1 = Service;

    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    var util = {
        uuid
    };

    const uuid$1 = util.uuid;


    const data = fs__default['default'].existsSync('./data') ? fs__default['default'].readdirSync('./data').reduce((p, c) => {
        const content = JSON.parse(fs__default['default'].readFileSync('./data/' + c));
        const collection = c.slice(0, -5);
        p[collection] = {};
        for (let endpoint in content) {
            p[collection][endpoint] = content[endpoint];
        }
        return p;
    }, {}) : {};

    const actions = {
        get: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            let responseData = data;
            for (let token of tokens) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            return responseData;
        },
        post: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            // TODO handle collisions, replacement
            let responseData = data;
            for (let token of tokens) {
                if (responseData.hasOwnProperty(token) == false) {
                    responseData[token] = {};
                }
                responseData = responseData[token];
            }

            const newId = uuid$1();
            responseData[newId] = Object.assign({}, body, { _id: newId });
            return responseData[newId];
        },
        put: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            let responseData = data;
            for (let token of tokens.slice(0, -1)) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            if (responseData !== undefined && responseData[tokens.slice(-1)] !== undefined) {
                responseData[tokens.slice(-1)] = body;
            }
            return responseData[tokens.slice(-1)];
        },
        patch: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            let responseData = data;
            for (let token of tokens) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            if (responseData !== undefined) {
                Object.assign(responseData, body);
            }
            return responseData;
        },
        delete: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            let responseData = data;

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                if (responseData.hasOwnProperty(token) == false) {
                    return null;
                }
                if (i == tokens.length - 1) {
                    const body = responseData[token];
                    delete responseData[token];
                    return body;
                } else {
                    responseData = responseData[token];
                }
            }
        }
    };

    const dataService = new Service_1();
    dataService.get(':collection', actions.get);
    dataService.post(':collection', actions.post);
    dataService.put(':collection', actions.put);
    dataService.patch(':collection', actions.patch);
    dataService.delete(':collection', actions.delete);


    var jsonstore = dataService.parseRequest;

    /*
     * This service requires storage and auth plugins
     */

    const { AuthorizationError: AuthorizationError$1 } = errors;



    const userService = new Service_1();

    userService.get('me', getSelf);
    userService.post('register', onRegister);
    userService.post('login', onLogin);
    userService.get('logout', onLogout);


    function getSelf(context, tokens, query, body) {
        if (context.user) {
            const result = Object.assign({}, context.user);
            delete result.hashedPassword;
            return result;
        } else {
            throw new AuthorizationError$1();
        }
    }

    function onRegister(context, tokens, query, body) {
        return context.auth.register(body);
    }

    function onLogin(context, tokens, query, body) {
        return context.auth.login(body);
    }

    function onLogout(context, tokens, query, body) {
        return context.auth.logout();
    }

    var users = userService.parseRequest;

    const { NotFoundError: NotFoundError$1, RequestError: RequestError$1 } = errors;


    var crud = {
        get,
        post,
        put,
        patch,
        delete: del
    };


    function validateRequest(context, tokens, query) {
        /*
        if (context.params.collection == undefined) {
            throw new RequestError('Please, specify collection name');
        }
        */
        if (tokens.length > 1) {
            throw new RequestError$1();
        }
    }

    function parseWhere(query) {
        const operators = {
            '<=': (prop, value) => record => record[prop] <= JSON.parse(value),
            '<': (prop, value) => record => record[prop] < JSON.parse(value),
            '>=': (prop, value) => record => record[prop] >= JSON.parse(value),
            '>': (prop, value) => record => record[prop] > JSON.parse(value),
            '=': (prop, value) => record => record[prop] == JSON.parse(value),
            ' like ': (prop, value) => record => record[prop].toLowerCase().includes(JSON.parse(value).toLowerCase()),
            ' in ': (prop, value) => record => JSON.parse(`[${/\((.+?)\)/.exec(value)[1]}]`).includes(record[prop]),
        };
        const pattern = new RegExp(`^(.+?)(${Object.keys(operators).join('|')})(.+?)$`, 'i');

        try {
            let clauses = [query.trim()];
            let check = (a, b) => b;
            let acc = true;
            if (query.match(/ and /gi)) {
                // inclusive
                clauses = query.split(/ and /gi);
                check = (a, b) => a && b;
                acc = true;
            } else if (query.match(/ or /gi)) {
                // optional
                clauses = query.split(/ or /gi);
                check = (a, b) => a || b;
                acc = false;
            }
            clauses = clauses.map(createChecker);

            return (record) => clauses
                .map(c => c(record))
                .reduce(check, acc);
        } catch (err) {
            throw new Error('Could not parse WHERE clause, check your syntax.');
        }

        function createChecker(clause) {
            let [match, prop, operator, value] = pattern.exec(clause);
            [prop, value] = [prop.trim(), value.trim()];

            return operators[operator.toLowerCase()](prop, value);
        }
    }


    function get(context, tokens, query, body) {
        validateRequest(context, tokens);

        let responseData;

        try {
            if (query.where) {
                responseData = context.storage.get(context.params.collection).filter(parseWhere(query.where));
            } else if (context.params.collection) {
                responseData = context.storage.get(context.params.collection, tokens[0]);
            } else {
                // Get list of collections
                return context.storage.get();
            }

            if (query.sortBy) {
                const props = query.sortBy
                    .split(',')
                    .filter(p => p != '')
                    .map(p => p.split(' ').filter(p => p != ''))
                    .map(([p, desc]) => ({ prop: p, desc: desc ? true : false }));

                // Sorting priority is from first to last, therefore we sort from last to first
                for (let i = props.length - 1; i >= 0; i--) {
                    let { prop, desc } = props[i];
                    responseData.sort(({ [prop]: propA }, { [prop]: propB }) => {
                        if (typeof propA == 'number' && typeof propB == 'number') {
                            return (propA - propB) * (desc ? -1 : 1);
                        } else {
                            return propA.localeCompare(propB) * (desc ? -1 : 1);
                        }
                    });
                }
            }

            if (query.offset) {
                responseData = responseData.slice(Number(query.offset) || 0);
            }
            const pageSize = Number(query.pageSize) || 10;
            if (query.pageSize) {
                responseData = responseData.slice(0, pageSize);
            }

            if (query.distinct) {
                const props = query.distinct.split(',').filter(p => p != '');
                responseData = Object.values(responseData.reduce((distinct, c) => {
                    const key = props.map(p => c[p]).join('::');
                    if (distinct.hasOwnProperty(key) == false) {
                        distinct[key] = c;
                    }
                    return distinct;
                }, {}));
            }

            if (query.count) {
                return responseData.length;
            }

            if (query.select) {
                const props = query.select.split(',').filter(p => p != '');
                responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

                function transform(r) {
                    const result = {};
                    props.forEach(p => result[p] = r[p]);
                    return result;
                }
            }

            if (query.load) {
                const props = query.load.split(',').filter(p => p != '');
                props.map(prop => {
                    const [propName, relationTokens] = prop.split('=');
                    const [idSource, collection] = relationTokens.split(':');
                    console.log(`Loading related records from "${collection}" into "${propName}", joined on "_id"="${idSource}"`);
                    const storageSource = collection == 'users' ? context.protectedStorage : context.storage;
                    responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

                    function transform(r) {
                        const seekId = r[idSource];
                        const related = storageSource.get(collection, seekId);
                        delete related.hashedPassword;
                        r[propName] = related;
                        return r;
                    }
                });
            }

        } catch (err) {
            console.error(err);
            if (err.message.includes('does not exist')) {
                throw new NotFoundError$1();
            } else {
                throw new RequestError$1(err.message);
            }
        }

        context.canAccess(responseData);

        return responseData;
    }

    function post(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length > 0) {
            throw new RequestError$1('Use PUT to update records');
        }
        context.canAccess(undefined, body);

        body._ownerId = context.user._id;
        let responseData;

        try {
            responseData = context.storage.add(context.params.collection, body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function put(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing, body);

        try {
            responseData = context.storage.set(context.params.collection, tokens[0], body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function patch(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing, body);

        try {
            responseData = context.storage.merge(context.params.collection, tokens[0], body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function del(context, tokens, query, body) {
        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing);

        try {
            responseData = context.storage.delete(context.params.collection, tokens[0]);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    /*
     * This service requires storage and auth plugins
     */

    const dataService$1 = new Service_1();
    dataService$1.get(':collection', crud.get);
    dataService$1.post(':collection', crud.post);
    dataService$1.put(':collection', crud.put);
    dataService$1.patch(':collection', crud.patch);
    dataService$1.delete(':collection', crud.delete);

    var data$1 = dataService$1.parseRequest;

    const imgdata = 'iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAPNnpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHja7ZpZdiS7DUT/uQovgSQ4LofjOd6Bl+8LZqpULbWm7vdnqyRVKQeCBAKBAFNm/eff2/yLr2hzMSHmkmpKlq9QQ/WND8VeX+38djac3+cr3af4+5fj5nHCc0h4l+vP8nJicdxzeN7Hxz1O43h8Gmi0+0T/9cT09/jlNuAeBs+XuMuAvQ2YeQ8k/jrhwj2Re3mplvy8hH3PKPr7SLl+jP6KkmL2OeErPnmbQ9q8Rmb0c2ynxafzO+eET7mC65JPjrM95exN2jmmlYLnophSTKLDZH+GGAwWM0cyt3C8nsHWWeG4Z/Tio7cHQiZ2M7JK8X6JE3t++2v5oj9O2nlvfApc50SkGQ5FDnm5B2PezJ8Bw1PUPvl6cYv5G788u8V82y/lPTgfn4CC+e2JN+Ds5T4ubzCVHu8M9JsTLr65QR5m/LPhvh6G/S8zcs75XzxZXn/2nmXvda2uhURs051x51bzMgwXdmIl57bEK/MT+ZzPq/IqJPEA+dMO23kNV50HH9sFN41rbrvlJu/DDeaoMci8ez+AjB4rkn31QxQxQV9u+yxVphRgM8CZSDDiH3Nxx2499oYrWJ6OS71jMCD5+ct8dcF3XptMNupie4XXXQH26nCmoZHT31xGQNy+4xaPg19ejy/zFFghgvG4ubDAZvs1RI/uFVtyACBcF3m/0sjlqVHzByUB25HJOCEENjmJLjkL2LNzQXwhQI2Ze7K0EwEXo59M0geRRGwKOMI292R3rvXRX8fhbuJDRkomNlUawQohgp8cChhqUWKIMZKxscQamyEBScaU0knM1E6WxUxO5pJrbkVKKLGkkksptbTqq1AjYiWLa6m1tobNFkyLjbsbV7TWfZceeuyp51567W0AnxFG1EweZdTRpp8yIayZZp5l1tmWI6fFrLDiSiuvsupqG6xt2WFHOCXvsutuj6jdUX33+kHU3B01fyKl1+VH1Diasw50hnDKM1FjRsR8cEQ8awQAtNeY2eJC8Bo5jZmtnqyInklGjc10thmXCGFYzsftHrF7jdy342bw9Vdx89+JnNHQ/QOR82bJm7j9JmqnGo8TsSsL1adWyD7Or9J8aTjbXx/+9v3/A/1vDUS9tHOXtLaM6JoBquRHJFHdaNU5oF9rKVSjYNewoFNsW032cqqCCx/yljA2cOy7+7zJ0biaicv1TcrWXSDXVT3SpkldUqqPIJj8p9oeWVs4upKL3ZHgpNzYnTRv5EeTYXpahYRgfC+L/FyxBphCmPLK3W1Zu1QZljTMJe5AIqmOyl0qlaFCCJbaPAIMWXzurWAMXiB1fGDtc+ld0ZU12k5cQq4v7+AB2x3qLlQ3hyU/uWdzzgUTKfXSputZRtp97hZ3z4EE36WE7WtjbqMtMr912oRp47HloZDlywxJ+uyzmrW91OivysrM1Mt1rZbrrmXm2jZrYWVuF9xZVB22jM4ccdaE0kh5jIrnzBy5w6U92yZzS1wrEao2ZPnE0tL0eRIpW1dOWuZ1WlLTqm7IdCESsV5RxjQ1/KWC/y/fPxoINmQZI8Cli9oOU+MJYgrv006VQbRGC2Ug8TYzrdtUHNjnfVc6/oN8r7tywa81XHdZN1QBUhfgzRLzmPCxu1G4sjlRvmF4R/mCYdUoF2BYNMq4AjD2GkMGhEt7PAJfKrH1kHmj8eukyLb1oCGW/WdAtx0cURYqtcGnNlAqods6UnaRpY3LY8GFbPeSrjKmsvhKnWTtdYKhRW3TImUqObdpGZgv3ltrdPwwtD+l1FD/htxAwjdUzhtIkWNVy+wBUmDtphwgVemd8jV1miFXWTpumqiqvnNuArCrFMbLPexJYpABbamrLiztZEIeYPasgVbnz9/NZxe4p/B+FV3zGt79B9S0Jc0Lu+YH4FXsAsa2YnRIAb2thQmGc17WdNd9cx4+y4P89EiVRKB+CvRkiPTwM7Ts+aZ5aV0C4zGoqyOGJv3yGMJaHXajKbOGkm40Ychlkw6c6hZ4s+SDJpsmncwmm8ChEmBWspX8MkFB+kzF1ZlgoGWiwzY6w4AIPDOcJxV3rtUnabEgoNBB4MbNm8GlluVIpsboaKl0YR8kGnXZH3JQZrH2MDxxRrHFUduh+CvQszakraM9XNo7rEVjt8VpbSOnSyD5dwLfVI4+Sl+DCZc5zU6zhrXnRhZqUowkruyZupZEm/dA2uVTroDg1nfdJMBua9yCJ8QPtGw2rkzlYLik5SBzUGSoOqBMJvwTe92eGgOVx8/T39TP0r/PYgfkP1IEyGVhYHXyJiVPU0skB3dGqle6OZuwj/Hw5c2gV5nEM6TYaAryq3CRXsj1088XNwt0qcliqNc6bfW+TttRydKpeJOUWTmmUiwJKzpr6hkVzzLrVs+s66xEiCwOzfg5IRgwQgFgrriRlg6WQS/nGyRUNDjulWsUbO8qu/lWaWeFe8QTs0puzrxXH1H0b91KgDm2dkdrpkpx8Ks2zZu4K1GHPpDxPdCL0RH0SZZrGX8hRKTA+oUPzQ+I0K1C16ZSK6TR28HUdlnfpzMsIvd4TR7iuSe/+pn8vief46IQULRGcHvRVUyn9aYeoHbGhEbct+vEuzIxhxJrgk1oyo3AFA7eSSSNI/Vxl0eLMCrJ/j1QH0ybj0C9VCn9BtXbz6Kd10b8QKtpTnecbnKHWZxcK2OiKCuViBHqrzM2T1uFlGJlMKFKRF1Zy6wMqQYtgKYc4PFoGv2dX2ixqGaoFDhjzRmp4fsygFZr3t0GmBqeqbcBFpvsMVCNajVWcLRaPBhRKc4RCCUGZphKJdisKdRjDKdaNbZfwM5BulzzCvyv0AsAlu8HOAdIXAuMAg0mWa0+0vgrODoHlm7Y7rXUHmm9r2RTLpXwOfOaT6iZdASpqOIXfiABLwQkrSPFXQgAMHjYyEVrOBESVgS4g4AxcXyiPwBiCF6g2XTPk0hqn4D67rbQVFv0Lam6Vfmvq90B3WgV+peoNRb702/tesrImcBCvIEaGoI/8YpKa1XmDNr1aGUwjDETBa3VkOLYVLGKeWQcd+WaUlsMdTdUg3TcUPvdT20ftDW4+injyAarDRVVRgc906sNTo1cu7LkDGewjkQ35Z7l4Htnx9MCkbenKiNMsif+5BNVnA6op3gZVZtjIAacNia+00w1ZutIibTMOJ7IISctvEQGDxEYDUSxUiH4R4kkH86dMywCqVJ2XpzkUYUgW3mDPmz0HLW6w9daRn7abZmo4QR5i/A21r4oEvCC31oajm5CR1yBZcIfN7rmgxM9qZBhXh3C6NR9dCS1PTMJ30c4fEcwkq0IXdphpB9eg4x1zycsof4t6C4jyS68eW7OonpSEYCzb5dWjQH3H5fWq2SH41O4LahPrSJA77KqpJYwH6pdxDfDIgxLR9GptCKMoiHETrJ0wFSR3Sk7yI97KdBVSHXeS5FBnYKIz1JU6VhdCkfHIP42o0V6aqgg00JtZfdK6hPeojtXvgfnE/VX0p0+fqxp2/nDfvBuHgeo7ppkrr/MyU1dT73n5B/qi76+lzMnVnHRJDeZOyj3XXdQrrtOUPQunDqgDlz+iuS3QDafITkJd050L0Hi2kiRBX52pIVso0ZpW1YQsT2VRgtxm9iiqU2qXyZ0OdvZy0J1gFotZFEuGrnt3iiiXvECX+UcWBqpPlgLRkdN7cpl8PxDjWseAu1bPdCjBSrQeVD2RHE7bRhMb1Qd3VHVXVNBewZ3Wm7avbifhB+4LNQrmp0WxiCNkm7dd7mV39SnokrvfzIr+oDSFq1D76MZchw6Vl4Z67CL01I6ZiX/VEqfM1azjaSkKqC+kx67tqTg5ntLii5b96TAA3wMTx2NvqsyyUajYQHJ1qkpmzHQITXDUZRGTYtNw9uLSndMmI9tfMdEeRgwWHB7NlosyivZPlvT5KIOc+GefU9UhA4MmKFXmhAuJRFVWHRJySbREImpQysz4g3uJckihD7P84nWtLo7oR4tr8IKdSBXYvYaZnm3ffhh9nyWPDa+zQfzdULsFlr/khrMb7hhAroOKSZgxbUzqdiVIhQc+iZaTbpesLXSbIfbjwXTf8AjbnV6kTpD4ZsMdXMK45G1NRiMdh/bLb6oXX+4rWHen9BW+xJDV1N+i6HTlKdLDMnVkx8tdHryus3VlCOXXKlDIiuOkimXnmzmrtbGqmAHL1TVXU73PX5nx3xhSO3QKtBqbd31iQHHBNXXrYIXHVyQqDGIcc6qHEcz2ieN+radKS9br/cGzC0G7g0YFQPGdqs7MI6pOt2BgYtt/4MNW8NJ3VT5es/izZZFd9yIfwY1lUubGSSnPiWWzDpAN+sExNptEoBx74q8bAzdFu6NocvC2RgK2WR7doZodiZ6OgoUrBoWIBM2xtMHXUX3GGktr5RtwPZ9tTWfleFP3iEc2hTar6IC1Y55ktYKQtXTsKkfgQ+al0aXBCh2dlCxdBtLtc8QJ4WUKIX+jlRR/TN9pXpNA1bUC7LaYUzJvxr6rh2Q7ellILBd0PcFF5F6uArA6ODZdjQYosZpf7lbu5kNFfbGUUY5C2p7esLhhjw94Miqk+8tDPgTVXX23iliu782KzsaVdexRSq4NORtmY3erV/NFsJU9S7naPXmPGLYvuy5USQA2pcb4z/fYafpPj0t5HEeD1y7W/Z+PHA2t8L1eGCCeFS/Ph04Hafu+Uf8ly2tjUNDQnNUIOqVLrBLIwxK67p3fP7LaX/LjnlniCYv6jNK0ce5YrPud1Gc6LQWg+sumIt2hCCVG3e8e5tsLAL2qWekqp1nKPKqKIJcmxO3oljxVa1TXVDVWmxQ/lhHHnYNP9UDrtFdwekRKCueDRSRAYoo0nEssbG3znTTDahVUXyDj+afeEhn3w/UyY0fSv5b8ZuSmaDVrURYmBrf0ZgIMOGuGFNG3FH45iA7VFzUnj/odcwHzY72OnQEhByP3PtKWxh/Q+/hkl9x5lEic5ojDGgEzcSpnJEwY2y6ZN0RiyMBhZQ35AigLvK/dt9fn9ZJXaHUpf9Y4IxtBSkanMxxP6xb/pC/I1D1icMLDcmjZlj9L61LoIyLxKGRjUcUtOiFju4YqimZ3K0odbd1Usaa7gPp/77IJRuOmxAmqhrWXAPOftoY0P/BsgifTmC2ChOlRSbIMBjjm3bQIeahGwQamM9wHqy19zaTCZr/AtjdNfWMu8SZAAAA13pUWHRSYXcgcHJvZmlsZSB0eXBlIGlwdGMAAHjaPU9LjkMhDNtzijlCyMd5HKflgdRdF72/xmFGJSIEx9ihvd6f2X5qdWizy9WH3+KM7xrRp2iw6hLARIfnSKsqoRKGSEXA0YuZVxOx+QcnMMBKJR2bMdNUDraxWJ2ciQuDDPKgNDA8kakNOwMLriTRO2Alk3okJsUiidC9Ex9HbNUMWJz28uQIzhhNxQduKhdkujHiSJVTCt133eqpJX/6MDXh7nrXydzNq9tssr14NXuwFXaoh/CPiLRfLvxMyj3GtTgAAAGFaUNDUElDQyBwcm9maWxlAAB4nH2RPUjDQBzFX1NFKfUD7CDikKE6WRAVESepYhEslLZCqw4ml35Bk4YkxcVRcC04+LFYdXBx1tXBVRAEP0Dc3JwUXaTE/yWFFjEeHPfj3b3H3TtAqJeZanaMA6pmGclYVMxkV8WuVwjoRQCz6JeYqcdTi2l4jq97+Ph6F+FZ3uf+HD1KzmSATySeY7phEW8QT29aOud94hArSgrxOfGYQRckfuS67PIb54LDAs8MGenkPHGIWCy0sdzGrGioxFPEYUXVKF/IuKxw3uKslquseU/+wmBOW0lxneYwYlhCHAmIkFFFCWVYiNCqkWIiSftRD/+Q40+QSyZXCYwcC6hAheT4wf/gd7dmfnLCTQpGgc4X2/4YAbp2gUbNtr+PbbtxAvifgSut5a/UgZlP0mstLXwE9G0DF9ctTd4DLneAwSddMiRH8tMU8nng/Yy+KQsM3AKBNbe35j5OH4A0dbV8AxwcAqMFyl73eHd3e2//nmn29wOGi3Kv+RixSgAAEkxpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOmlwdGNFeHQ9Imh0dHA6Ly9pcHRjLm9yZy9zdGQvSXB0YzR4bXBFeHQvMjAwOC0wMi0yOS8iCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpwbHVzPSJodHRwOi8vbnMudXNlcGx1cy5vcmcvbGRmL3htcC8xLjAvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgeG1sbnM6eG1wUmlnaHRzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvcmlnaHRzLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOjdjZDM3NWM3LTcwNmItNDlkMy1hOWRkLWNmM2Q3MmMwY2I4ZCIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2NGY2YTJlYy04ZjA5LTRkZTMtOTY3ZC05MTUyY2U5NjYxNTAiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxMmE1NzI5Mi1kNmJkLTRlYjQtOGUxNi1hODEzYjMwZjU0NWYiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjEzMzAwNzI5NTMwNjQzIgogICBHSU1QOlZlcnNpb249IjIuMTAuMTIiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBwaG90b3Nob3A6Q3JlZGl0PSJHZXR0eSBJbWFnZXMvaVN0b2NrcGhvdG8iCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXBSaWdodHM6V2ViU3RhdGVtZW50PSJodHRwczovL3d3dy5pc3RvY2twaG90by5jb20vbGVnYWwvbGljZW5zZS1hZ3JlZW1lbnQ/dXRtX21lZGl1bT1vcmdhbmljJmFtcDt1dG1fc291cmNlPWdvb2dsZSZhbXA7dXRtX2NhbXBhaWduPWlwdGN1cmwiPgogICA8aXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgIDxpcHRjRXh0OkxvY2F0aW9uU2hvd24+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvblNob3duPgogICA8aXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgIDxpcHRjRXh0OlJlZ2lzdHJ5SWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpSZWdpc3RyeUlkPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjOTQ2M2MxMC05OWE4LTQ1NDQtYmRlOS1mNzY0ZjdhODJlZDkiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjEtMDItMTRUMTM6MDU6MjkiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8cGx1czpJbWFnZVN1cHBsaWVyPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VTdXBwbGllcj4KICAgPHBsdXM6SW1hZ2VDcmVhdG9yPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VDcmVhdG9yPgogICA8cGx1czpDb3B5cmlnaHRPd25lcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkNvcHlyaWdodE93bmVyPgogICA8cGx1czpMaWNlbnNvcj4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgcGx1czpMaWNlbnNvclVSTD0iaHR0cHM6Ly93d3cuaXN0b2NrcGhvdG8uY29tL3Bob3RvL2xpY2Vuc2UtZ20xMTUwMzQ1MzQxLT91dG1fbWVkaXVtPW9yZ2FuaWMmYW1wO3V0bV9zb3VyY2U9Z29vZ2xlJmFtcDt1dG1fY2FtcGFpZ249aXB0Y3VybCIvPgogICAgPC9yZGY6U2VxPgogICA8L3BsdXM6TGljZW5zb3I+CiAgIDxkYzpjcmVhdG9yPgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaT5WbGFkeXNsYXYgU2VyZWRhPC9yZGY6bGk+CiAgICA8L3JkZjpTZXE+CiAgIDwvZGM6Y3JlYXRvcj4KICAgPGRjOmRlc2NyaXB0aW9uPgogICAgPHJkZjpBbHQ+CiAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5TZXJ2aWNlIHRvb2xzIGljb24gb24gd2hpdGUgYmFja2dyb3VuZC4gVmVjdG9yIGlsbHVzdHJhdGlvbi48L3JkZjpsaT4KICAgIDwvcmRmOkFsdD4KICAgPC9kYzpkZXNjcmlwdGlvbj4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PmWJCnkAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQflAg4LBR0CZnO/AAAARHRFWHRDb21tZW50AFNlcnZpY2UgdG9vbHMgaWNvbiBvbiB3aGl0ZSBiYWNrZ3JvdW5kLiBWZWN0b3IgaWxsdXN0cmF0aW9uLlwvEeIAAAMxSURBVHja7Z1bcuQwCEX7qrLQXlp2ynxNVWbK7dgWj3sl9JvYRhxACD369erW7UMzx/cYaychonAQvXM5ABYkpynoYIiEGdoQog6AYfywBrCxF4zNrX/7McBbuXJe8rXx/KBDULcGsMREzCbeZ4J6ME/9wVH5d95rogZp3npEgPLP3m2iUSGqXBJS5Dr6hmLm8kRuZABYti5TMaailV8LodNQwTTUWk4/WZk75l0kM0aZQdaZjMqkrQDAuyMVJWFjMB4GANXr0lbZBxQKr7IjI7QvVWkok/Jn5UHVh61CYPs+/i7eL9j3y/Au8WqoAIC34k8/9k7N8miLcaGWHwgjZXE/awyYX7h41wKMCskZM2HXAddDkTdglpSjz5bcKPbcCEKwT3+DhxtVpJvkEC7rZSgq32NMSBoXaCdiahDCKrND0fpX8oQlVsQ8IFQZ1VARdIF5wroekAjB07gsAgDUIbQHFENIDEX4CQANIVe8Iw/ASiACLXl28eaf579OPuBa9/mrELUYHQ1t3KHlZZnRcXb2/c7ygXIQZqjDMEzeSrOgCAhqYMvTUE+FKXoVxTxgk3DEPREjGzj3nAk/VaKyB9GVIu4oMyOlrQZgrBBEFG9PAZTfs3amYDGrP9Wl964IeFvtz9JFluIvlEvcdoXDOdxggbDxGwTXcxFRi/LdirKgZUBm7SUdJG69IwSUzAMWgOAq/4hyrZVaJISSNWHFVbEoCFEhyBrCtXS9L+so9oTy8wGqxbQDD350WTjNESVFEB5hdKzUGcV5QtYxVWR2Ssl4Mg9qI9u6FCBInJRXgfEEgtS9Cgrg7kKouq4mdcDNBnEHQvWFTdgdgsqP+MiluVeBM13ahx09AYSWi50gsF+I6vn7BmCEoHR3NBzkpIOw4+XdVBBGQUioblaZHbGlodtB+N/jxqwLX/x/NARfD8ADxTOCKIcwE4Lw0OIbguMYcGTlymEpHYLXIKx8zQEqIfS2lGJPaADFEBR/PMH79ErqtpnZmTBlvM4wgihPWDEEhXn1LISj50crNgfCp+dWHYQRCfb2zgfnBZmKGAyi914anK9Coi4LOMhoAn3uVtn+AGnLKxPUZnCuAAAAAElFTkSuQmCC';
    const img = Buffer.from(imgdata, 'base64');

    var favicon = (method, tokens, query, body) => {
        console.log('serving favicon...');
        const headers = {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        };
        let result = img;

        return {
            headers,
            result
        };
    };

    var require$$0 = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>SUPS Admin Panel</title>\n    <style>\n        * {\n            padding: 0;\n            margin: 0;\n        }\n\n        body {\n            padding: 32px;\n            font-size: 16px;\n        }\n\n        .layout::after {\n            content: '';\n            clear: both;\n            display: table;\n        }\n\n        .col {\n            display: block;\n            float: left;\n        }\n\n        p {\n            padding: 8px 16px;\n        }\n\n        table {\n            border-collapse: collapse;\n        }\n\n        caption {\n            font-size: 120%;\n            text-align: left;\n            padding: 4px 8px;\n            font-weight: bold;\n            background-color: #ddd;\n        }\n\n        table, tr, th, td {\n            border: 1px solid #ddd;\n        }\n\n        th, td {\n            padding: 4px 8px;\n        }\n\n        ul {\n            list-style: none;\n        }\n\n        .collection-list a {\n            display: block;\n            width: 120px;\n            padding: 4px 8px;\n            text-decoration: none;\n            color: black;\n            background-color: #ccc;\n        }\n        .collection-list a:hover {\n            background-color: #ddd;\n        }\n        .collection-list a:visited {\n            color: black;\n        }\n    </style>\n    <script type=\"module\">\nimport { html, render } from 'https://unpkg.com/lit-html@1.3.0?module';\nimport { until } from 'https://unpkg.com/lit-html@1.3.0/directives/until?module';\n\nconst api = {\n    async get(url) {\n        return json(url);\n    },\n    async post(url, body) {\n        return json(url, {\n            method: 'POST',\n            headers: { 'Content-Type': 'application/json' },\n            body: JSON.stringify(body)\n        });\n    }\n};\n\nasync function json(url, options) {\n    return await (await fetch('/' + url, options)).json();\n}\n\nasync function getCollections() {\n    return api.get('data');\n}\n\nasync function getRecords(collection) {\n    return api.get('data/' + collection);\n}\n\nasync function getThrottling() {\n    return api.get('util/throttle');\n}\n\nasync function setThrottling(throttle) {\n    return api.post('util', { throttle });\n}\n\nasync function collectionList(onSelect) {\n    const collections = await getCollections();\n\n    return html`\n    <ul class=\"collection-list\">\n        ${collections.map(collectionLi)}\n    </ul>`;\n\n    function collectionLi(name) {\n        return html`<li><a href=\"javascript:void(0)\" @click=${(ev) => onSelect(ev, name)}>${name}</a></li>`;\n    }\n}\n\nasync function recordTable(collectionName) {\n    const records = await getRecords(collectionName);\n    const layout = getLayout(records);\n\n    return html`\n    <table>\n        <caption>${collectionName}</caption>\n        <thead>\n            <tr>${layout.map(f => html`<th>${f}</th>`)}</tr>\n        </thead>\n        <tbody>\n            ${records.map(r => recordRow(r, layout))}\n        </tbody>\n    </table>`;\n}\n\nfunction getLayout(records) {\n    const result = new Set(['_id']);\n    records.forEach(r => Object.keys(r).forEach(k => result.add(k)));\n\n    return [...result.keys()];\n}\n\nfunction recordRow(record, layout) {\n    return html`\n    <tr>\n        ${layout.map(f => html`<td>${JSON.stringify(record[f]) || html`<span>(missing)</span>`}</td>`)}\n    </tr>`;\n}\n\nasync function throttlePanel(display) {\n    const active = await getThrottling();\n\n    return html`\n    <p>\n        Request throttling: </span>${active}</span>\n        <button @click=${(ev) => set(ev, true)}>Enable</button>\n        <button @click=${(ev) => set(ev, false)}>Disable</button>\n    </p>`;\n\n    async function set(ev, state) {\n        ev.target.disabled = true;\n        await setThrottling(state);\n        display();\n    }\n}\n\n//import page from '//unpkg.com/page/page.mjs';\n\n\nfunction start() {\n    const main = document.querySelector('main');\n    editor(main);\n}\n\nasync function editor(main) {\n    let list = html`<div class=\"col\">Loading&hellip;</div>`;\n    let viewer = html`<div class=\"col\">\n    <p>Select collection to view records</p>\n</div>`;\n    display();\n\n    list = html`<div class=\"col\">${await collectionList(onSelect)}</div>`;\n    display();\n\n    async function display() {\n        render(html`\n        <section class=\"layout\">\n            ${until(throttlePanel(display), html`<p>Loading</p>`)}\n        </section>\n        <section class=\"layout\">\n            ${list}\n            ${viewer}\n        </section>`, main);\n    }\n\n    async function onSelect(ev, name) {\n        ev.preventDefault();\n        viewer = html`<div class=\"col\">${await recordTable(name)}</div>`;\n        display();\n    }\n}\n\nstart();\n\n</script>\n</head>\n<body>\n    <main>\n        Loading&hellip;\n    </main>\n</body>\n</html>";

    const mode = process.argv[2] == '-dev' ? 'dev' : 'prod';

    const files = {
        index: mode == 'prod' ? require$$0 : fs__default['default'].readFileSync('./client/index.html', 'utf-8')
    };

    var admin = (method, tokens, query, body) => {
        const headers = {
            'Content-Type': 'text/html'
        };
        let result = '';

        const resource = tokens.join('/');
        if (resource && resource.split('.').pop() == 'js') {
            headers['Content-Type'] = 'application/javascript';

            files[resource] = files[resource] || fs__default['default'].readFileSync('./client/' + resource, 'utf-8');
            result = files[resource];
        } else {
            result = files.index;
        }

        return {
            headers,
            result
        };
    };

    /*
     * This service requires util plugin
     */

    const utilService = new Service_1();

    utilService.post('*', onRequest);
    utilService.get(':service', getStatus);

    function getStatus(context, tokens, query, body) {
        return context.util[context.params.service];
    }

    function onRequest(context, tokens, query, body) {
        Object.entries(body).forEach(([k, v]) => {
            console.log(`${k} ${v ? 'enabled' : 'disabled'}`);
            context.util[k] = v;
        });
        return '';
    }

    var util$1 = utilService.parseRequest;

    var services = {
        jsonstore,
        users,
        data: data$1,
        favicon,
        admin,
        util: util$1
    };

    const { uuid: uuid$2 } = util;


    function initPlugin(settings) {
        const storage = createInstance(settings.seedData);
        const protectedStorage = createInstance(settings.protectedData);

        return function decoreateContext(context, request) {
            context.storage = storage;
            context.protectedStorage = protectedStorage;
        };
    }


    /**
     * Create storage instance and populate with seed data
     * @param {Object=} seedData Associative array with data. Each property is an object with properties in format {key: value}
     */
    function createInstance(seedData = {}) {
        const collections = new Map();

        // Initialize seed data from file    
        for (let collectionName in seedData) {
            if (seedData.hasOwnProperty(collectionName)) {
                const collection = new Map();
                for (let recordId in seedData[collectionName]) {
                    if (seedData.hasOwnProperty(collectionName)) {
                        collection.set(recordId, seedData[collectionName][recordId]);
                    }
                }
                collections.set(collectionName, collection);
            }
        }


        // Manipulation

        /**
         * Get entry by ID or list of all entries from collection or list of all collections
         * @param {string=} collection Name of collection to access. Throws error if not found. If omitted, returns list of all collections.
         * @param {number|string=} id ID of requested entry. Throws error if not found. If omitted, returns of list all entries in collection.
         * @return {Object} Matching entry.
         */
        function get(collection, id) {
            if (!collection) {
                return [...collections.keys()];
            }
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!id) {
                const entries = [...targetCollection.entries()];
                let result = entries.map(([k, v]) => {
                    return Object.assign(deepCopy(v), { _id: k });
                });
                return result;
            }
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }
            const entry = targetCollection.get(id);
            return Object.assign(deepCopy(entry), { _id: id });
        }

        /**
         * Add new entry to collection. ID will be auto-generated
         * @param {string} collection Name of collection to access. If the collection does not exist, it will be created.
         * @param {Object} data Value to store.
         * @return {Object} Original value with resulting ID under _id property.
         */
        function add(collection, data) {
            const record = assignClean({ _ownerId: data._ownerId }, data);

            let targetCollection = collections.get(collection);
            if (!targetCollection) {
                targetCollection = new Map();
                collections.set(collection, targetCollection);
            }
            let id = uuid$2();
            // Make sure new ID does not match existing value
            while (targetCollection.has(id)) {
                id = uuid$2();
            }

            record._createdOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Replace entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @param {Object} data Value to store. Record will be replaced!
         * @return {Object} Updated entry.
         */
        function set(collection, id, data) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }

            const existing = targetCollection.get(id);
            const record = assignSystemProps(deepCopy(data), existing);
            record._updatedOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Modify entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @param {Object} data Value to store. Shallow merge will be performed!
         * @return {Object} Updated entry.
         */
        function merge(collection, id, data) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }

            const existing = deepCopy(targetCollection.get(id));
            const record = assignClean(existing, data);
            record._updatedOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Delete entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @return {{_deletedOn: number}} Server time of deletion.
         */
        function del(collection, id) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }
            targetCollection.delete(id);

            return { _deletedOn: Date.now() };
        }

        /**
         * Search in collection by query object
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {Object} query Query object. Format {prop: value}.
         * @return {Object[]} Array of matching entries.
         */
        function query(collection, query) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            const result = [];
            // Iterate entries of target collection and compare each property with the given query
            for (let [key, entry] of [...targetCollection.entries()]) {
                let match = true;
                for (let prop in entry) {
                    if (query.hasOwnProperty(prop)) {
                        const targetValue = query[prop];
                        // Perform lowercase search, if value is string
                        if (typeof targetValue === 'string' && typeof entry[prop] === 'string') {
                            if (targetValue.toLocaleLowerCase() !== entry[prop].toLocaleLowerCase()) {
                                match = false;
                                break;
                            }
                        } else if (targetValue != entry[prop]) {
                            match = false;
                            break;
                        }
                    }
                }

                if (match) {
                    result.push(Object.assign(deepCopy(entry), { _id: key }));
                }
            }

            return result;
        }

        return { get, add, set, merge, delete: del, query };
    }


    function assignSystemProps(target, entry, ...rest) {
        const whitelist = [
            '_id',
            '_createdOn',
            '_updatedOn',
            '_ownerId'
        ];
        for (let prop of whitelist) {
            if (entry.hasOwnProperty(prop)) {
                target[prop] = deepCopy(entry[prop]);
            }
        }
        if (rest.length > 0) {
            Object.assign(target, ...rest);
        }

        return target;
    }


    function assignClean(target, entry, ...rest) {
        const blacklist = [
            '_id',
            '_createdOn',
            '_updatedOn',
            '_ownerId'
        ];
        for (let key in entry) {
            if (blacklist.includes(key) == false) {
                target[key] = deepCopy(entry[key]);
            }
        }
        if (rest.length > 0) {
            Object.assign(target, ...rest);
        }

        return target;
    }

    function deepCopy(value) {
        if (Array.isArray(value)) {
            return value.map(deepCopy);
        } else if (typeof value == 'object') {
            return [...Object.entries(value)].reduce((p, [k, v]) => Object.assign(p, { [k]: deepCopy(v) }), {});
        } else {
            return value;
        }
    }

    var storage = initPlugin;

    const { ConflictError: ConflictError$1, CredentialError: CredentialError$1, RequestError: RequestError$2 } = errors;

    function initPlugin$1(settings) {
        const identity = settings.identity;

        return function decorateContext(context, request) {
            context.auth = {
                register,
                login,
                logout
            };

            const userToken = request.headers['x-authorization'];
            if (userToken !== undefined) {
                let user;
                const session = findSessionByToken(userToken);
                if (session !== undefined) {
                    const userData = context.protectedStorage.get('users', session.userId);
                    if (userData !== undefined) {
                        console.log('Authorized as ' + userData[identity]);
                        user = userData;
                    }
                }
                if (user !== undefined) {
                    context.user = user;
                } else {
                    throw new CredentialError$1('Invalid access token');
                }
            }

            function register(body) {
                if (body.hasOwnProperty(identity) === false ||
                    body.hasOwnProperty('password') === false ||
                    body[identity].length == 0 ||
                    body.password.length == 0) {
                    throw new RequestError$2('Missing fields');
                } else if (context.protectedStorage.query('users', { [identity]: body[identity] }).length !== 0) {
                    throw new ConflictError$1(`A user with the same ${identity} already exists`);
                } else {
                    const newUser = Object.assign({}, body, {
                        [identity]: body[identity],
                        hashedPassword: hash(body.password)
                    });
                    const result = context.protectedStorage.add('users', newUser);
                    delete result.hashedPassword;

                    const session = saveSession(result._id);
                    result.accessToken = session.accessToken;

                    return result;
                }
            }

            function login(body) {
                const targetUser = context.protectedStorage.query('users', { [identity]: body[identity] });
                if (targetUser.length == 1) {
                    if (hash(body.password) === targetUser[0].hashedPassword) {
                        const result = targetUser[0];
                        delete result.hashedPassword;

                        const session = saveSession(result._id);
                        result.accessToken = session.accessToken;

                        return result;
                    } else {
                        throw new CredentialError$1('Login or password don\'t match');
                    }
                } else {
                    throw new CredentialError$1('Login or password don\'t match');
                }
            }

            function logout() {
                if (context.user !== undefined) {
                    const session = findSessionByUserId(context.user._id);
                    if (session !== undefined) {
                        context.protectedStorage.delete('sessions', session._id);
                    }
                } else {
                    throw new CredentialError$1('User session does not exist');
                }
            }

            function saveSession(userId) {
                let session = context.protectedStorage.add('sessions', { userId });
                const accessToken = hash(session._id);
                session = context.protectedStorage.set('sessions', session._id, Object.assign({ accessToken }, session));
                return session;
            }

            function findSessionByToken(userToken) {
                return context.protectedStorage.query('sessions', { accessToken: userToken })[0];
            }

            function findSessionByUserId(userId) {
                return context.protectedStorage.query('sessions', { userId })[0];
            }
        };
    }


    const secret = 'This is not a production server';

    function hash(string) {
        const hash = crypto__default['default'].createHmac('sha256', secret);
        hash.update(string);
        return hash.digest('hex');
    }

    var auth = initPlugin$1;

    function initPlugin$2(settings) {
        const util = {
            throttle: false
        };

        return function decoreateContext(context, request) {
            context.util = util;
        };
    }

    var util$2 = initPlugin$2;

    /*
     * This plugin requires auth and storage plugins
     */

    const { RequestError: RequestError$3, ConflictError: ConflictError$2, CredentialError: CredentialError$2, AuthorizationError: AuthorizationError$2 } = errors;

    function initPlugin$3(settings) {
        const actions = {
            'GET': '.read',
            'POST': '.create',
            'PUT': '.update',
            'PATCH': '.update',
            'DELETE': '.delete'
        };
        const rules = Object.assign({
            '*': {
                '.create': ['User'],
                '.update': ['Owner'],
                '.delete': ['Owner']
            }
        }, settings.rules);

        return function decorateContext(context, request) {
            // special rules (evaluated at run-time)
            const get = (collectionName, id) => {
                return context.storage.get(collectionName, id);
            };
            const isOwner = (user, object) => {
                return user._id == object._ownerId;
            };
            context.rules = {
                get,
                isOwner
            };
            const isAdmin = request.headers.hasOwnProperty('x-admin');

            context.canAccess = canAccess;

            function canAccess(data, newData) {
                const user = context.user;
                const action = actions[request.method];
                let { rule, propRules } = getRule(action, context.params.collection, data);

                if (Array.isArray(rule)) {
                    rule = checkRoles(rule, data);
                } else if (typeof rule == 'string') {
                    rule = !!(eval(rule));
                }
                if (!rule && !isAdmin) {
                    throw new CredentialError$2();
                }
                propRules.map(r => applyPropRule(action, r, user, data, newData));
            }

            function applyPropRule(action, [prop, rule], user, data, newData) {
                // NOTE: user needs to be in scope for eval to work on certain rules
                if (typeof rule == 'string') {
                    rule = !!eval(rule);
                }

                if (rule == false) {
                    if (action == '.create' || action == '.update') {
                        delete newData[prop];
                    } else if (action == '.read') {
                        delete data[prop];
                    }
                }
            }

            function checkRoles(roles, data, newData) {
                if (roles.includes('Guest')) {
                    return true;
                } else if (!context.user && !isAdmin) {
                    throw new AuthorizationError$2();
                } else if (roles.includes('User')) {
                    return true;
                } else if (context.user && roles.includes('Owner')) {
                    return context.user._id == data._ownerId;
                } else {
                    return false;
                }
            }
        };



        function getRule(action, collection, data = {}) {
            let currentRule = ruleOrDefault(true, rules['*'][action]);
            let propRules = [];

            // Top-level rules for the collection
            const collectionRules = rules[collection];
            if (collectionRules !== undefined) {
                // Top-level rule for the specific action for the collection
                currentRule = ruleOrDefault(currentRule, collectionRules[action]);

                // Prop rules
                const allPropRules = collectionRules['*'];
                if (allPropRules !== undefined) {
                    propRules = ruleOrDefault(propRules, getPropRule(allPropRules, action));
                }

                // Rules by record id 
                const recordRules = collectionRules[data._id];
                if (recordRules !== undefined) {
                    currentRule = ruleOrDefault(currentRule, recordRules[action]);
                    propRules = ruleOrDefault(propRules, getPropRule(recordRules, action));
                }
            }

            return {
                rule: currentRule,
                propRules
            };
        }

        function ruleOrDefault(current, rule) {
            return (rule === undefined || rule.length === 0) ? current : rule;
        }

        function getPropRule(record, action) {
            const props = Object
                .entries(record)
                .filter(([k]) => k[0] != '.')
                .filter(([k, v]) => v.hasOwnProperty(action))
                .map(([k, v]) => [k, v[action]]);

            return props;
        }
    }

    var rules = initPlugin$3;

    var identity = "email";
    var protectedData = {
        users: {
            "35c62d76-8152-4626-8712-eeb96381bea8": {
                email: "peter@abv.bg",
                username: "Peter",
                address: {
                    phone: "+1-415-123456",
                    street_building: "1355 Market St, Suite 900",
                    city: "San Francisco",
                    region: "California",
                    postalCode: "CA 94103",
                    country: "USA"
                },
                hashedPassword: "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1"
            },
            "847ec027-f659-4086-8032-5173e2f9c93a": {
                email: "george@abv.bg",
                username: "George",
                address: {
                    phone: "+1-415-123456",
                    street_building: "1355 Market St, Suite 900",
                    city: "San Francisco",
                    region: "California",
                    postalCode: "CA 94103",
                    country: "USA"
                },
                hashedPassword: "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1"
            },
            "60f0cf0b-34b0-4abd-9769-8c42f830dffc": {
                email: "admin@abv.bg",
                username: "Admin",
                address: {
                    phone: "+1-415-123456",
                    street_building: "1355 Market St, Suite 900",
                    city: "San Francisco",
                    region: "California",
                    postalCode: "CA 94103",
                    country: "USA"
                },
                hashedPassword: "fac7060c3e17e6f151f247eacb2cd5ae80b8c36aedb8764e18a41bbdc16aa302"
            }
        },
        sessions: {
        }
    };
    var seedData = {
        jackets: {
            "cf32d131-bd40-4b35-a31a-63f86672b81f": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "cf32d131-bd40-4b35-a31a-63f86672b81f",
                _createdOn: 1721649548094,
                image: "https://cdn.pixabay.com/photo/2017/09/07/04/54/khaki-2723896_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/clothes/jackets/colors/jackets-1-white.webp", "../../../assets/public/static/images/catalog/clothes/jackets/colors/jackets-1-black.webp", "../../../assets/public/static/images/catalog/clothes/jackets/colors/jackets-1-blue.webp", "../../../assets/public/static/images/catalog/clothes/jackets/colors/jackets-1-red.webp"],
                cat: "clothes",
                subCat: "jackets",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 3,
                price: 67,
            },
            "8cbacf3d-cd95-4bfe-ae01-bbcbac8bcabc": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "8cbacf3d-cd95-4bfe-ae01-bbcbac8bcabc",
                _createdOn: 1721649549094,
                image: "https://cdn.pixabay.com/photo/2018/10/22/21/44/fashion-3766441_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/clothes/jackets/colors/jackets-2-yellow.webp", "../../../assets/public/static/images/catalog/clothes/jackets/colors/jackets-2-brown.webp"],
                cat: "clothes",
                subCat: "jackets",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 2,
                price: 55,
            },
            "e2e8aa93-c44f-44c3-bde9-71d20fbfcd28": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "e2e8aa93-c44f-44c3-bde9-71d20fbfcd28",
                _createdOn: 1721649550094,
                image: "https://cdn.pixabay.com/photo/2021/07/04/09/45/jacket-6385904_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/clothes/jackets/colors/jackets-3-green.webp", "../../../assets/public/static/images/catalog/clothes/jackets/colors/jackets-3-gray.webp"],
                cat: "clothes",
                subCat: "jackets",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 7,
                price: 38,
            },
            "a782d9ad-5cff-4689-89ba-95eb608f6505": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "a782d9ad-5cff-4689-89ba-95eb608f6505",
                _createdOn: 1721649551094,
                image: "https://cdn.pixabay.com/photo/2023/11/27/09/37/jacket-8414997_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/clothes/jackets/colors/jackets-4-pink.webp", "../../../assets/public/static/images/catalog/clothes/jackets/colors/jackets-4-orange.webp"],
                cat: "clothes",
                subCat: "jackets",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 49,
            },
            "cadbc572-e875-44b6-9893-a9ce4225caad": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "cadbc572-e875-44b6-9893-a9ce4225caad",
                _createdOn: 1721649552094,
                image: "https://cdn.pixabay.com/photo/2018/10/03/17/42/leather-3721996_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/clothes/jackets/colors/jackets-5-beige.webp", "../../../assets/public/static/images/catalog/clothes/jackets/colors/jackets-5-chartreuse.webp"],
                cat: "clothes",
                subCat: "jackets",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 14,
                price: 55,
            },
            "cdb259c1-2a5f-459c-b2e0-b898f40cbe1d": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "cdb259c1-2a5f-459c-b2e0-b898f40cbe1d",
                _createdOn: 1721649553094,
                image: "https://cdn.pixabay.com/photo/2023/06/03/05/41/jacket-8036987_960_720.png",
                altImages: ["../../../assets/public/static/images/catalog/clothes/jackets/colors/jackets-6-crimson.webp", "../../../assets/public/static/images/catalog/clothes/jackets/colors/jackets-6-greenYellow.webp"],
                cat: "clothes",
                subCat: "jackets",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 22,
                price: 56,
            }
        },
        longwear: {
            "074f7f34-4135-427a-912f-75abe4f1af25": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "074f7f34-4135-427a-912f-75abe4f1af25",
                _createdOn: 1721680076577,
                image: "https://cdn.pixabay.com/photo/2023/08/30/14/49/woman-8223469_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/clothes/longwear/colors/longwear-1-white.webp", "../../../assets/public/static/images/catalog/clothes/longwear/colors/longwear-1-black.webp", "../../../assets/public/static/images/catalog/clothes/longwear/colors/longwear-1-blue.webp", "../../../assets/public/static/images/catalog/clothes/longwear/colors/longwear-1-red.webp"],
                cat: "clothes",
                subCat: "longwear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 3,
                price: 67,
            },
            "9886ebc1-bbb3-474d-b924-a7354f7cc8a7": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "9886ebc1-bbb3-474d-b924-a7354f7cc8a7",
                _createdOn: 1721680077577,
                image: "https://cdn.pixabay.com/photo/2023/11/01/16/30/portrait-8358190_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/clothes/longwear/colors/longwear-2-yellow.webp", "../../../assets/public/static/images/catalog/clothes/longwear/colors/longwear-2-brown.webp"],
                cat: "clothes",
                subCat: "longwear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 2,
                price: 55,
            },
            "9be8a412-59b6-40ab-ac23-c11c93336c2f": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "9be8a412-59b6-40ab-ac23-c11c93336c2f",
                _createdOn: 1721680078577,
                image: "https://cdn.pixabay.com/photo/2022/12/21/09/36/ao-dai-7669645_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/clothes/longwear/colors/longwear-3-green.webp", "../../../assets/public/static/images/catalog/clothes/longwear/colors/longwear-3-gray.webp"],
                cat: "clothes",
                subCat: "longwear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 7,
                price: 38,
            },
            "f385d860-80c5-4333-a521-7f20d9fbc103": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "f385d860-80c5-4333-a521-7f20d9fbc103",
                _createdOn: 1721680079577,
                image: "https://cdn.pixabay.com/photo/2021/04/16/07/22/ao-dai-6182832_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/clothes/longwear/colors/longwear-4-pink.webp", "../../../assets/public/static/images/catalog/clothes/longwear/colors/longwear-4-orange.webp"],
                cat: "clothes",
                subCat: "longwear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 49,
            },
            "f9a3aeab-254f-448b-bd09-13a94a1ca6b8": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "f9a3aeab-254f-448b-bd09-13a94a1ca6b8",
                _createdOn: 1721680080577,
                image: "https://cdn.pixabay.com/photo/2022/05/23/12/28/woman-7216050_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/clothes/longwear/colors/longwear-5-beige.webp", "../../../assets/public/static/images/catalog/clothes/longwear/colors/longwear-5-chartreuse.webp"],
                cat: "clothes",
                subCat: "longwear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 14,
                price: 55,
            },
            "82318714-2204-4908-9ef5-98e6b4c51a55": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "82318714-2204-4908-9ef5-98e6b4c51a55",
                _createdOn: 1721680081577,
                image: "https://cdn.pixabay.com/photo/2021/03/22/16/14/woman-6115123_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/clothes/longwear/colors/longwear-6-crimson.webp", "../../../assets/public/static/images/catalog/clothes/longwear/colors/longwear-6-greenYellow.webp"],
                cat: "clothes",
                subCat: "longwear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 22,
                price: 56,
            }
        },
        trainers: {
            "1842171e-6e12-4813-a01c-b0a2cf342a78": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "1842171e-6e12-4813-a01c-b0a2cf342a78",
                _createdOn: 1721713463429,
                image: "https://cdn.pixabay.com/photo/2019/04/26/21/50/shoes-4158783_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-1-white.webp", "../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-1-black.webp", "../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-1-blue.webp", "../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-1-red.webp"],
                cat: "shoes",
                subCat: "trainers",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "db449a28-8294-4e57-bfd6-21767c2de7d3": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "db449a28-8294-4e57-bfd6-21767c2de7d3",
                _createdOn: 1721713464429,
                image: "https://cdn.pixabay.com/photo/2013/05/31/20/00/shoes-115102_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-2-yellow.webp", "../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-2-brown.webp"],
                cat: "shoes",
                subCat: "trainers",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "f48c7711-5d8e-4a33-81a8-54c12942e3d2": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "f48c7711-5d8e-4a33-81a8-54c12942e3d2",
                _createdOn: 1721713465429,
                image: "https://cdn.pixabay.com/photo/2015/11/05/22/33/sneakers-1024979_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-3-green.webp", "../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-3-gray.webp"],
                cat: "shoes",
                subCat: "trainers",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "2a3fae4c-c7c1-41e8-a3ca-460e6d5911a6": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "2a3fae4c-c7c1-41e8-a3ca-460e6d5911a6",
                _createdOn: 1721713466429,
                image: "https://cdn.pixabay.com/photo/2013/05/31/20/33/running-shoes-115149_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-4-pink.webp", "../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-4-orange.webp"],
                cat: "shoes",
                subCat: "trainers",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "6d23eba6-cae8-488e-9395-4a8a763fbcda": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "6d23eba6-cae8-488e-9395-4a8a763fbcda",
                _createdOn: 1721713467429,
                image: "https://cdn.pixabay.com/photo/2020/06/29/04/33/shoes-5351339_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-5-beige.webp", "../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-5-chartreuse.webp"],
                cat: "shoes",
                subCat: "trainers",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "dd70c02f-8e4f-4e61-8707-9c9827045000": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "dd70c02f-8e4f-4e61-8707-9c9827045000",
                _createdOn: 1721713468429,
                image: "https://cdn.pixabay.com/photo/2017/04/26/18/12/running-shoes-2263268_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-6-crimson.webp", "../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-6-greenYellow.webp"],
                cat: "shoes",
                subCat: "trainers",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        boots: {
            "3d61458f-57f4-4b6b-b41d-7d47858d7a8a": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "3d61458f-57f4-4b6b-b41d-7d47858d7a8a",
                _createdOn: 1721713469429,
                image: "https://cdn.pixabay.com/photo/2016/09/02/11/10/boots-1638873_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/boots/colors/boots-1-white.webp", "../../../assets/public/static/images/catalog/shoes/boots/colors/boots-1-black.webp", "../../../assets/public/static/images/catalog/shoes/boots/colors/boots-1-blue.webp", "../../../assets/public/static/images/catalog/shoes/boots/colors/boots-1-red.webp"],
                cat: "shoes",
                subCat: "boots",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "74f96ba9-afa5-464e-9589-81649b55c63b": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "74f96ba9-afa5-464e-9589-81649b55c63b",
                _createdOn: 1721713470429,
                image: "https://cdn.pixabay.com/photo/2017/07/31/15/06/boot-2558324_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/boots/colors/boots-2-yellow.webp", "../../../assets/public/static/images/catalog/shoes/boots/colors/boots-2-brown.webp"],
                cat: "shoes",
                subCat: "boots",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "d26cc179-d72e-4e5e-a027-5fd95450bd20": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "d26cc179-d72e-4e5e-a027-5fd95450bd20",
                _createdOn: 1721713471429,
                image: "https://cdn.pixabay.com/photo/2021/11/28/20/01/walking-boots-6831103_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/boots/colors/boots-3-green.webp", "../../../assets/public/static/images/catalog/shoes/boots/colors/boots-3-gray.webp"],
                cat: "shoes",
                subCat: "boots",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "05a1e9b5-6aed-47d1-8dbf-8710ed0a05f2": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "05a1e9b5-6aed-47d1-8dbf-8710ed0a05f2",
                _createdOn: 1721713472429,
                image: "https://cdn.pixabay.com/photo/2018/01/01/18/01/hiking-shoes-3054634_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/boots/colors/boots-4-pink.webp", "../../../assets/public/static/images/catalog/shoes/boots/colors/boots-4-orange.webp"],
                cat: "shoes",
                subCat: "boots",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "082fdb17-114d-414e-af85-7ce902fed3f8": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "082fdb17-114d-414e-af85-7ce902fed3f8",
                _createdOn: 1721713473429,
                image: "https://cdn.pixabay.com/photo/2018/12/10/21/34/winter-boots-3867776_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/boots/colors/boots-5-beige.webp", "../../../assets/public/static/images/catalog/shoes/boots/colors/boots-5-chartreuse.webp"],
                cat: "shoes",
                subCat: "boots",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "8bc94d8f-b45d-4c5e-a2bb-ba5dc9957cea": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "8bc94d8f-b45d-4c5e-a2bb-ba5dc9957cea",
                _createdOn: 1721713474429,
                image: "https://cdn.pixabay.com/photo/2019/04/17/10/17/work-boots-4133817_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/boots/colors/boots-6-crimson.webp", "../../../assets/public/static/images/catalog/shoes/boots/colors/boots-6-greenYellow.webp"],
                cat: "shoes",
                subCat: "boots",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        slippers: {
            "ce6b95ed-7703-4e75-92aa-cedca5140635": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "ce6b95ed-7703-4e75-92aa-cedca5140635",
                _createdOn: 1721713475429,
                image: "https://cdn.pixabay.com/photo/2020/03/05/20/45/slippers-4905435_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-1-white.webp", "../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-1-black.webp", "../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-1-blue.webp", "../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-1-red.webp"],
                cat: "shoes",
                subCat: "slippers",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "9f80a27b-c0e0-433b-979f-91b6c32a31e1": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "9f80a27b-c0e0-433b-979f-91b6c32a31e1",
                _createdOn: 1721713476429,
                image: "https://cdn.pixabay.com/photo/2015/04/03/06/50/slippers-704705_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-2-yellow.webp", "../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-2-brown.webp"],
                cat: "shoes",
                subCat: "slippers",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "d53f37a7-857f-4758-83cf-16d16f924b83": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "d53f37a7-857f-4758-83cf-16d16f924b83",
                _createdOn: 1721713477429,
                image: "https://cdn.pixabay.com/photo/2014/01/28/19/54/slippers-253923_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-3-green.webp", "../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-3-gray.webp"],
                cat: "shoes",
                subCat: "slippers",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "fb01dfe8-7f86-4eca-8055-311324238f15": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "fb01dfe8-7f86-4eca-8055-311324238f15",
                _createdOn: 1721713478429,
                image: "https://cdn.pixabay.com/photo/2016/06/03/06/02/slippers-1432817_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-4-pink.webp", "../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-4-orange.webp"],
                cat: "shoes",
                subCat: "slippers",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "140b3d37-e2e6-4c7a-8567-da67d82b7c74": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "140b3d37-e2e6-4c7a-8567-da67d82b7c74",
                _createdOn: 1721713479429,
                image: "https://cdn.pixabay.com/photo/2015/01/21/01/27/slippers-606277_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-5-beige.webp", "../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-5-chartreuse.webp"],
                cat: "shoes",
                subCat: "slippers",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "19e5e727-b481-4eb8-95dd-5c5240bc5e3e": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "19e5e727-b481-4eb8-95dd-5c5240bc5e3e",
                _createdOn: 1721713480429,
                image: "https://cdn.pixabay.com/photo/2014/07/19/11/53/shoes-396996_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-6-crimson.webp", "../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-6-greenYellow.webp"],
                cat: "shoes",
                subCat: "slippers",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        caps_hats: {
            "251d224c-d2a8-46e5-81ea-90c84fa468e9": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "251d224c-d2a8-46e5-81ea-90c84fa468e9",
                _createdOn: 1721715464524,
                image: "https://cdn.pixabay.com/photo/2015/09/09/21/16/hat-933427_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-1-white.webp", "../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-1-black.webp", "../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-1-blue.webp", "../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-1-red.webp"],
                cat: "accessories",
                subCat: "caps_hats",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 3,
                price: 67,
            },
            "9966e773-9487-4562-b537-22bc1c0c74e3": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "9966e773-9487-4562-b537-22bc1c0c74e3",
                _createdOn: 1721715465524,
                image: "https://cdn.pixabay.com/photo/2016/05/25/20/24/hat-1415776_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-2-yellow.webp", "../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-2-brown.webp"],
                cat: "accessories",
                subCat: "caps_hats",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 2,
                price: 55,
            },
            "cc515c51-25e2-4f9f-b552-dc315b1652d7": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "cc515c51-25e2-4f9f-b552-dc315b1652d7",
                _createdOn: 1721715466524,
                image: "https://cdn.pixabay.com/photo/2021/06/18/10/30/cap-6345767_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-3-green.webp", "../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-3-gray.webp"],
                cat: "accessories",
                subCat: "caps_hats",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 7,
                price: 38,
            },
            "612ce75f-bfdd-4421-8f01-840ea9a29bb1": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "612ce75f-bfdd-4421-8f01-840ea9a29bb1",
                _createdOn: 1721715467524,
                image: "https://cdn.pixabay.com/photo/2017/10/18/19/12/straw-hat-2865220_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-4-pink.webp", "../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-4-orange.webp"],
                cat: "accessories",
                subCat: "caps_hats",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 49,
            },
            "2587a3ec-7978-4eef-b7ff-46ed578fcc7a": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "2587a3ec-7978-4eef-b7ff-46ed578fcc7a",
                _createdOn: 1721715468524,
                image: "https://cdn.pixabay.com/photo/2016/09/05/18/41/hat-1647353_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-5-beige.webp", "../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-5-chartreuse.webp"],
                cat: "accessories",
                subCat: "caps_hats",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 14,
                price: 55,
            },
            "545ce913-05c8-4c37-8a9b-277a1aa9b7c5": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "545ce913-05c8-4c37-8a9b-277a1aa9b7c5",
                _createdOn: 1721715469524,
                image: "https://cdn.pixabay.com/photo/2016/01/02/00/51/hat-1117296_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-6-crimson.webp", "../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-6-greenYellow.webp"],
                cat: "accessories",
                subCat: "caps_hats",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 22,
                price: 56,
            }
        },
        belts: {
            "f867844d-eca5-4da0-ade0-ef2076bd5442": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "f867844d-eca5-4da0-ade0-ef2076bd5442",
                _createdOn: 1721715470524,
                image: "https://cdn.pixabay.com/photo/2013/06/16/21/56/belt-139757_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/belts/colors/belts-1-white.webp", "../../../assets/public/static/images/catalog/accessories/belts/colors/belts-1-black.webp", "../../../assets/public/static/images/catalog/accessories/belts/colors/belts-1-blue.webp", "../../../assets/public/static/images/catalog/accessories/belts/colors/belts-1-red.webp"],
                cat: "accessories",
                subCat: "belts",
                description: "Lorem ipsum dolor sit amet....",
                size: [30, 32, 34, 36],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "0c7e01a6-fae7-40b8-b579-613c9aae776d": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "0c7e01a6-fae7-40b8-b579-613c9aae776d",
                _createdOn: 1721715471524,
                image: "https://cdn.pixabay.com/photo/2015/05/29/22/18/waist-belt-789903_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/belts/colors/belts-2-yellow.webp", "../../../assets/public/static/images/catalog/accessories/belts/colors/belts-2-brown.webp"],
                cat: "accessories",
                subCat: "belts",
                description: "Lorem ipsum dolor sit amet....",
                size: [27, 28, 29, 30],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "9e57f29a-2910-4c4f-b211-e3271f7c07db": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "9e57f29a-2910-4c4f-b211-e3271f7c07db",
                _createdOn: 1721715472524,
                image: "https://cdn.pixabay.com/photo/2018/06/03/23/47/belt-3451963_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/belts/colors/belts-3-green.webp", "../../../assets/public/static/images/catalog/accessories/belts/colors/belts-3-gray.webp"],
                cat: "accessories",
                subCat: "belts",
                description: "Lorem ipsum dolor sit amet....",
                size: [35, 36, 37, 38],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "8e7979ce-50f7-41e7-9bc6-12af5e692516": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "8e7979ce-50f7-41e7-9bc6-12af5e692516",
                _createdOn: 1721715473524,
                image: "https://cdn.pixabay.com/photo/2021/02/02/08/48/belt-5973152_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/belts/colors/belts-4-pink.webp", "../../../assets/public/static/images/catalog/accessories/belts/colors/belts-4-orange.webp"],
                cat: "accessories",
                subCat: "belts",
                description: "Lorem ipsum dolor sit amet....",
                size: [27, 28, 29, 30],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "572883fb-4f2e-443e-8bd9-280fc1072fa6": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "572883fb-4f2e-443e-8bd9-280fc1072fa6",
                _createdOn: 1721715474524,
                image: "https://cdn.pixabay.com/photo/2018/06/26/13/29/belt-buckle-3499410_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/belts/colors/belts-5-beige.webp", "../../../assets/public/static/images/catalog/accessories/belts/colors/belts-5-chartreuse.webp"],
                cat: "accessories",
                subCat: "belts",
                description: "Lorem ipsum dolor sit amet....",
                size: [30, 32, 34, 36],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "3019e643-54f5-4767-b90c-e102d8de51f2": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "3019e643-54f5-4767-b90c-e102d8de51f2",
                _createdOn: 1721715475524,
                image: "https://cdn.pixabay.com/photo/2015/09/05/19/35/brown-924734_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/belts/colors/belts-6-crimson.webp", "../../../assets/public/static/images/catalog/accessories/belts/colors/belts-6-greenYellow.webp"],
                cat: "accessories",
                subCat: "belts",
                description: "Lorem ipsum dolor sit amet....",
                size: [35, 36, 37, 38],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        gloves: {
            "8ca111d0-3c8d-4042-8950-ef310d776cb4": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "8ca111d0-3c8d-4042-8950-ef310d776cb4",
                _createdOn: 1721715476524,
                image: "https://cdn.pixabay.com/photo/2020/01/04/08/53/fashion-4740023_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-1-white.webp", "../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-1-black.webp", "../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-1-blue.webp", "../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-1-red.webp"],
                cat: "accessories",
                subCat: "gloves",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "dea96f4e-1550-46b0-a6c7-9cc51b3f7ebd": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "dea96f4e-1550-46b0-a6c7-9cc51b3f7ebd",
                _createdOn: 1721715477524,
                image: "https://cdn.pixabay.com/photo/2016/02/03/14/56/mittens-1177211_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-2-yellow.webp", "../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-2-brown.webp"],
                cat: "accessories",
                subCat: "gloves",
                description: "Lorem ipsum dolor sit amet....",
                size: [7, 7.5, 8.5, 10],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "4a7fa928-e054-4f2a-b2b5-f54ce046a0f7": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "4a7fa928-e054-4f2a-b2b5-f54ce046a0f7",
                _createdOn: 1721715478524,
                image: "https://cdn.pixabay.com/photo/2017/08/05/03/02/el-2582138_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-3-green.webp", "../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-3-gray.webp"],
                cat: "accessories",
                subCat: "gloves",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "299d18f0-6bf2-4605-8a00-82b9da04d2e6": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "299d18f0-6bf2-4605-8a00-82b9da04d2e6",
                _createdOn: 1721715479524,
                image: "https://cdn.pixabay.com/photo/2021/04/26/13/34/gloves-6208920_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-4-pink.webp", "../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-4-orange.webp"],
                cat: "accessories",
                subCat: "gloves",
                description: "Lorem ipsum dolor sit amet....",
                size: [7, 7.5, 8.5, 10],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "cc73d130-210a-4e79-8d7a-7b200ed4170d": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "cc73d130-210a-4e79-8d7a-7b200ed4170d",
                _createdOn: 1721715480524,
                image: "https://cdn.pixabay.com/photo/2016/02/11/20/21/mens-leather-gloves-1194450_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-5-beige.webp", "../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-5-chartreuse.webp"],
                cat: "accessories",
                subCat: "gloves",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "a092c650-5761-4c2f-a2c9-d65dd82faa7a": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "a092c650-5761-4c2f-a2c9-d65dd82faa7a",
                _createdOn: 1721715481524,
                image: "https://cdn.pixabay.com/photo/2016/02/11/20/21/dark-brown-leather-gloves-1194453_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-6-crimson.webp", "../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-6-greenYellow.webp"],
                cat: "accessories",
                subCat: "gloves",
                description: "Lorem ipsum dolor sit amet....",
                size: [8, 8.5, 9.5, 10],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        sunglasses: {
            "853f3446-e27e-4e4d-8df1-e5dfde4ec22d": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "853f3446-e27e-4e4d-8df1-e5dfde4ec22d",
                _createdOn: 1721715482524,
                image: "https://cdn.pixabay.com/photo/2017/08/06/12/33/aviator-sunglasses-2592111_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-1-white.webp", "../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-1-black.webp", "../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-1-blue.webp", "../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-1-red.webp"],
                cat: "accessories",
                subCat: "sunglasses",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 3,
                price: 47,
            },
            "995d201c-224b-492d-85dc-0f54c3caa1b8": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "995d201c-224b-492d-85dc-0f54c3caa1b8",
                _createdOn: 1721715483524,
                image: "https://cdn.pixabay.com/photo/2017/07/13/14/05/wood-sunglasses-2500491_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-2-yellow.webp", "../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-2-brown.webp"],
                cat: "accessories",
                subCat: "sunglasses",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 2,
                price: 40,
            },
            "700ecdb8-8987-42d7-b3c8-2350bb0a9b48": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "700ecdb8-8987-42d7-b3c8-2350bb0a9b48",
                _createdOn: 1721715484524,
                image: "https://cdn.pixabay.com/photo/2013/09/01/17/54/sunglasses-178153_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-3-green.webp", "../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-3-gray.webp"],
                cat: "accessories",
                subCat: "sunglasses",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 7,
                price: 33,
            },
            "e2dae4a7-77f2-43ec-943a-2a89222dd672": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "e2dae4a7-77f2-43ec-943a-2a89222dd672",
                _createdOn: 1721715485524,
                image: "https://cdn.pixabay.com/photo/2019/05/05/18/27/glasses-4181316_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-4-pink.webp", "../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-4-orange.webp"],
                cat: "accessories",
                subCat: "sunglasses",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 42,
            },
            "af7a58f3-bb9d-4a09-9395-bfc124d6de37": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "af7a58f3-bb9d-4a09-9395-bfc124d6de37",
                _createdOn: 1721715486524,
                image: "https://cdn.pixabay.com/photo/2015/07/22/21/24/oakley-856122_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-5-beige.webp", "../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-5-chartreuse.webp"],
                cat: "accessories",
                subCat: "sunglasses",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 14,
                price: 21,
            },
            "bfb59ac0-328f-4f6d-afaa-fd74e5c1352f": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "bfb59ac0-328f-4f6d-afaa-fd74e5c1352f",
                _createdOn: 1721715487524,
                image: "https://cdn.pixabay.com/photo/2022/11/11/20/20/glasses-7585754_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-6-crimson.webp", "../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-6-greenYellow.webp"],
                cat: "accessories",
                subCat: "sunglasses",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 22,
                price: 37,
            }
        },
        watches: {
            "a8ca7709-8458-4392-8dce-fbd7220b89b6": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "a8ca7709-8458-4392-8dce-fbd7220b89b6",
                _createdOn: 1721715488524,
                image: "https://cdn.pixabay.com/photo/2016/11/29/13/39/analog-watch-1869928_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/watches/colors/watches-1-white.webp", "../../../assets/public/static/images/catalog/accessories/watches/colors/watches-1-black.webp", "../../../assets/public/static/images/catalog/accessories/watches/colors/watches-1-blue.webp", "../../../assets/public/static/images/catalog/accessories/watches/colors/watches-1-red.webp"],
                cat: "accessories",
                subCat: "watches",
                description: "Lorem ipsum dolor sit amet....",
                size: [32, 34, 36, 37],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "c54ca5dc-c54b-4b76-b3b3-4bc70d191752": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "c54ca5dc-c54b-4b76-b3b3-4bc70d191752",
                _createdOn: 1721715489524,
                image: "https://cdn.pixabay.com/photo/2014/07/31/23/00/wristwatch-407096_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/watches/colors/watches-2-yellow.webp", "../../../assets/public/static/images/catalog/accessories/watches/colors/watches-2-brown.webp"],
                cat: "accessories",
                subCat: "watches",
                description: "Lorem ipsum dolor sit amet....",
                size: [37, 39, 43, 45],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "aab22e23-ce37-425b-b801-8f7f70f1061c": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "aab22e23-ce37-425b-b801-8f7f70f1061c",
                _createdOn: 1721715490524,
                image: "https://cdn.pixabay.com/photo/2017/03/03/04/31/clock-2113254_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/watches/colors/watches-3-green.webp", "../../../assets/public/static/images/catalog/accessories/watches/colors/watches-3-gray.webp"],
                cat: "accessories",
                subCat: "watches",
                description: "Lorem ipsum dolor sit amet....",
                size: [32, 34, 36, 37],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "2c02cf71-206b-40a3-a099-92ab9a51d018": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "2c02cf71-206b-40a3-a099-92ab9a51d018",
                _createdOn: 1721715491524,
                image: "https://cdn.pixabay.com/photo/2018/01/18/19/06/time-3091031_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/watches/colors/watches-4-pink.webp", "../../../assets/public/static/images/catalog/accessories/watches/colors/watches-4-orange.webp"],
                cat: "accessories",
                subCat: "watches",
                description: "Lorem ipsum dolor sit amet....",
                size: [22, 24, 26, 28],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "78741946-e9d2-4c76-8804-c1cb167d2413": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "78741946-e9d2-4c76-8804-c1cb167d2413",
                _createdOn: 1721715492524,
                image: "https://cdn.pixabay.com/photo/2013/07/11/15/30/male-watch-144648_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/watches/colors/watches-5-beige.webp", "../../../assets/public/static/images/catalog/accessories/watches/colors/watches-5-chartreuse.webp"],
                cat: "accessories",
                subCat: "watches",
                description: "Lorem ipsum dolor sit amet....",
                size: [32, 34, 36, 37],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "e947c90c-1237-483b-b10d-dc51b7817e09": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "e947c90c-1237-483b-b10d-dc51b7817e09",
                _createdOn: 1721715493524,
                image: "https://cdn.pixabay.com/photo/2017/03/10/17/06/swatch-watch-2133289_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/accessories/watches/colors/watches-6-crimson.webp", "../../../assets/public/static/images/catalog/accessories/watches/colors/watches-6-greenYellow.webp"],
                cat: "accessories",
                subCat: "watches",
                description: "Lorem ipsum dolor sit amet....",
                size: [22, 24, 26, 28],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        gym: {
            "14910eb8-8174-4407-88b3-e8df7cf11cde": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "14910eb8-8174-4407-88b3-e8df7cf11cde",
                _createdOn: 1721747857094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/07/12/fitness-8905614__340.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/gym/colors/gym-1-white.webp", "../../../assets/public/static/images/catalog/sportswear/gym/colors/gym-1-black.webp", "../../../assets/public/static/images/catalog/sportswear/gym/colors/gym-1-blue.webp", "../../../assets/public/static/images/catalog/sportswear/gym/colors/gym-1-red.webp"],
                cat: "sportswear",
                subCat: "gym",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "c56a32a8-6576-44bd-bb45-94b48b360d47": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "c56a32a8-6576-44bd-bb45-94b48b360d47",
                _createdOn: 1721747858094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/07/12/fitness-8905612__340.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/gym/colors/gym-2-yellow.webp", "../../../assets/public/static/images/catalog/sportswear/gym/colors/gym-2-brown.webp"],
                cat: "sportswear",
                subCat: "gym",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "bd2ccbdf-a5ac-4e44-96f7-48cbd2cd957d": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "bd2ccbdf-a5ac-4e44-96f7-48cbd2cd957d",
                _createdOn: 1721747859094,
                image: "https://cdn.pixabay.com/photo/2024/07/17/12/19/fitness-8901413_960_720.png",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/gym/colors/gym-3-green.webp", "../../../assets/public/static/images/catalog/sportswear/gym/colors/gym-3-gray.webp"],
                cat: "sportswear",
                subCat: "gym",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "d490a02e-8387-4e9c-b8aa-b5cdb7275230": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "d490a02e-8387-4e9c-b8aa-b5cdb7275230",
                _createdOn: 1721747860094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/07/12/fitness-8905613__340.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/gym/colors/gym-4-pink.webp", "../../../assets/public/static/images/catalog/sportswear/gym/colors/gym-4-orange.webp"],
                cat: "sportswear",
                subCat: "gym",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "696154de-b8a1-490f-a72a-6b2f206deeec": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "696154de-b8a1-490f-a72a-6b2f206deeec",
                _createdOn: 1721747861094,
                image: "https://cdn.pixabay.com/photo/2024/07/17/12/19/fitness-8901408_960_720.png",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/gym/colors/gym-5-beige.webp", "../../../assets/public/static/images/catalog/sportswear/gym/colors/gym-5-chartreuse.webp"],
                cat: "sportswear",
                subCat: "gym",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "edd931f2-3c23-417f-99fe-a42e91ffdc2f": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "edd931f2-3c23-417f-99fe-a42e91ffdc2f",
                _createdOn: 1721747862094,
                image: "https://cdn.pixabay.com/photo/2024/07/17/12/19/fitness-8901409_960_720.png",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/gym/colors/gym-6-crimson.webp", "../../../assets/public/static/images/catalog/sportswear/gym/colors/gym-6-greenYellow.webp"],
                cat: "sportswear",
                subCat: "gym",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        running: {
            "2c607497-8814-4129-b689-0c6cc49151fe": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "2c607497-8814-4129-b689-0c6cc49151fe",
                _createdOn: 1721747863094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/08/05/fitness-8905694_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/running/colors/running-1-white.webp", "../../../assets/public/static/images/catalog/sportswear/running/colors/running-1-black.webp", "../../../assets/public/static/images/catalog/sportswear/running/colors/running-1-blue.webp", "../../../assets/public/static/images/catalog/sportswear/running/colors/running-1-red.webp"],
                cat: "sportswear",
                subCat: "running",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "0d642883-bf87-4d7f-b402-9a91668d2da2": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "0d642883-bf87-4d7f-b402-9a91668d2da2",
                _createdOn: 1721747864094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/08/05/fitness-8905693_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/running/colors/running-2-yellow.webp", "../../../assets/public/static/images/catalog/sportswear/running/colors/running-2-brown.webp"],
                cat: "sportswear",
                subCat: "running",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "d8b7fc37-76a0-4ccc-b48a-07ffca1ad93a": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "d8b7fc37-76a0-4ccc-b48a-07ffca1ad93a",
                _createdOn: 1721747865094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/08/05/fitness-8905695_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/running/colors/running-3-green.webp", "../../../assets/public/static/images/catalog/sportswear/running/colors/running-3-gray.webp"],
                cat: "sportswear",
                subCat: "running",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "1b4a7f92-b2e5-46a0-ae87-f02cc7d23896": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "1b4a7f92-b2e5-46a0-ae87-f02cc7d23896",
                _createdOn: 1721747866094,
                image: "https://cdn.pixabay.com/photo/2024/07/17/20/40/fitness-8902498_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/running/colors/running-4-pink.webp", "../../../assets/public/static/images/catalog/sportswear/running/colors/running-4-orange.webp"],
                cat: "sportswear",
                subCat: "running",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "ebde504e-796e-4a62-948a-d0421a113000": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "ebde504e-796e-4a62-948a-d0421a113000",
                _createdOn: 1721747867094,
                image: "https://cdn.pixabay.com/photo/2024/07/17/20/40/fitness-8902499_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/running/colors/running-5-beige.webp", "../../../assets/public/static/images/catalog/sportswear/running/colors/running-5-chartreuse.webp"],
                cat: "sportswear",
                subCat: "running",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "ca8c2516-93a7-4272-9c21-88f957acf407": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "ca8c2516-93a7-4272-9c21-88f957acf407",
                _createdOn: 1721747868094,
                image: "https://cdn.pixabay.com/photo/2024/07/17/20/40/fitness-8902497_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/running/colors/running-6-crimson.webp", "../../../assets/public/static/images/catalog/sportswear/running/colors/running-6-greenYellow.webp"],
                cat: "sportswear",
                subCat: "running",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        ski_snowboard: {
            "9db34254-2203-4696-b69d-7997ce745fea": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "9db34254-2203-4696-b69d-7997ce745fea",
                _createdOn: 1721747869094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/08/03/ski-8903451_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/ski_snowboard/colors/ski_snowboard-1-white.webp", "../../../assets/public/static/images/catalog/sportswear/ski_snowboard/colors/ski_snowboard-1-black.webp", "../../../assets/public/static/images/catalog/sportswear/ski_snowboard/colors/ski_snowboard-1-blue.webp", "../../../assets/public/static/images/catalog/sportswear/ski_snowboard/colors/ski_snowboard-1-red.webp"],
                cat: "sportswear",
                subCat: "ski_snowboard",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "226de618-40e3-42a6-ab3e-fa4190f38cd5": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "226de618-40e3-42a6-ab3e-fa4190f38cd5",
                _createdOn: 1721747870094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/08/03/ski-8903450_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/ski_snowboard/colors/ski_snowboard-2-yellow.webp", "../../../assets/public/static/images/catalog/sportswear/ski_snowboard/colors/ski_snowboard-2-brown.webp"],
                cat: "sportswear",
                subCat: "ski_snowboard",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "a5a5b679-3fd7-481e-927b-8dd4dc311082": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "a5a5b679-3fd7-481e-927b-8dd4dc311082",
                _createdOn: 1721747871094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/08/03/ski-8903448_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/ski_snowboard/colors/ski_snowboard-3-green.webp", "../../../assets/public/static/images/catalog/sportswear/ski_snowboard/colors/ski_snowboard-3-gray.webp"],
                cat: "sportswear",
                subCat: "ski_snowboard",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "cd9dd1a7-f6ff-4a25-8358-fc849c4bdf0e": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "cd9dd1a7-f6ff-4a25-8358-fc849c4bdf0e",
                _createdOn: 1721747872094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/08/03/ski-8903449_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/ski_snowboard/colors/ski_snowboard-4-pink.webp", "../../../assets/public/static/images/catalog/sportswear/ski_snowboard/colors/ski_snowboard-4-orange.webp"],
                cat: "sportswear",
                subCat: "ski_snowboard",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "ed524511-5f80-43da-a423-b582cc01c31a": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "ed524511-5f80-43da-a423-b582cc01c31a",
                _createdOn: 1721747873094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/08/03/ski-8903447_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/ski_snowboard/colors/ski_snowboard-5-beige.webp", "../../../assets/public/static/images/catalog/sportswear/ski_snowboard/colors/ski_snowboard-5-chartreuse.webp"],
                cat: "sportswear",
                subCat: "ski_snowboard",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "373a559d-6444-4da0-bbab-a806c988a919": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "373a559d-6444-4da0-bbab-a806c988a919",
                _createdOn: 1721747874094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/08/03/ski-8903446_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/ski_snowboard/colors/ski_snowboard-6-crimson.webp", "../../../assets/public/static/images/catalog/sportswear/ski_snowboard/colors/ski_snowboard-6-greenYellow.webp"],
                cat: "sportswear",
                subCat: "ski_snowboard",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        swim_surf: {
            "b2b15d0a-cf28-4322-a29c-c455bf9ff415": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "b2b15d0a-cf28-4322-a29c-c455bf9ff415",
                _createdOn: 1721747875094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/10/09/swimming-8903762_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/swim_surf/colors/swim_surf-1-white.webp", "../../../assets/public/static/images/catalog/sportswear/swim_surf/colors/swim_surf-1-black.webp", "../../../assets/public/static/images/catalog/sportswear/swim_surf/colors/swim_surf-1-blue.webp", "../../../assets/public/static/images/catalog/sportswear/swim_surf/colors/swim_surf-1-red.webp"],
                cat: "sportswear",
                subCat: "swim_surf",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "2dc43f78-3f9a-4a8b-a99f-8f93a4ccbdfd": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "2dc43f78-3f9a-4a8b-a99f-8f93a4ccbdfd",
                _createdOn: 1721747876094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/10/09/swimming-8903760_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/swim_surf/colors/swim_surf-2-yellow.webp", "../../../assets/public/static/images/catalog/sportswear/swim_surf/colors/swim_surf-2-brown.webp"],
                cat: "sportswear",
                subCat: "swim_surf",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "43344240-038c-4f36-b1a6-1bda98f4bbcc": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "43344240-038c-4f36-b1a6-1bda98f4bbcc",
                _createdOn: 1721747877094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/10/09/swimming-8903759_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/swim_surf/colors/swim_surf-3-green.webp", "../../../assets/public/static/images/catalog/sportswear/swim_surf/colors/swim_surf-3-gray.webp"],
                cat: "sportswear",
                subCat: "swim_surf",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "71ebb209-a644-4c7c-a5d0-9736d51490b7": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "71ebb209-a644-4c7c-a5d0-9736d51490b7",
                _createdOn: 1721747878094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/10/09/swimming-8903758_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/swim_surf/colors/swim_surf-4-pink.webp", "../../../assets/public/static/images/catalog/sportswear/swim_surf/colors/swim_surf-4-orange.webp"],
                cat: "sportswear",
                subCat: "swim_surf",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "a0bb6efa-2f47-4e6c-9d24-a547f166a0da": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "a0bb6efa-2f47-4e6c-9d24-a547f166a0da",
                _createdOn: 1721747879094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/10/09/swimming-8903757_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/swim_surf/colors/swim_surf-5-beige.webp", "../../../assets/public/static/images/catalog/sportswear/swim_surf/colors/swim_surf-5-chartreuse.webp"],
                cat: "sportswear",
                subCat: "swim_surf",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "05707784-55b6-426d-a508-f3a620d337b4": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "05707784-55b6-426d-a508-f3a620d337b4",
                _createdOn: 1721747880094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/10/09/swimming-8903756_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/swim_surf/colors/swim_surf-6-crimson.webp", "../../../assets/public/static/images/catalog/sportswear/swim_surf/colors/swim_surf-6-greenYellow.webp"],
                cat: "sportswear",
                subCat: "swim_surf",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        outdoors: {
            "6662ede5-f87b-47ea-a113-7c8304337052": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "6662ede5-f87b-47ea-a113-7c8304337052",
                _createdOn: 1721747881094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/11/37/outdoors-8903986_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-1-white.webp", "../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-1-black.webp", "../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-1-blue.webp", "../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-1-red.webp"],
                cat: "sportswear",
                subCat: "outdoors",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "34536797-32d3-450d-9413-42cf6380dd03": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "34536797-32d3-450d-9413-42cf6380dd03",
                _createdOn: 1721747882094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/11/37/outdoors-8903983_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-2-yellow.webp", "../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-2-brown.webp"],
                cat: "sportswear",
                subCat: "outdoors",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "f24740ea-a402-4461-b58e-33a0d6cd2069": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "f24740ea-a402-4461-b58e-33a0d6cd2069",
                _createdOn: 1721747883094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/11/37/outdoors-8903985_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-3-green.webp", "../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-3-gray.webp"],
                cat: "sportswear",
                subCat: "outdoors",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "50601a75-1471-420f-9612-a5b362c301e1": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "50601a75-1471-420f-9612-a5b362c301e1",
                _createdOn: 1721747884094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/11/37/outdoors-8903984_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-4-pink.webp", "../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-4-orange.webp"],
                cat: "sportswear",
                subCat: "outdoors",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "c7c585fe-3529-4bda-a332-94408828c33a": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "c7c585fe-3529-4bda-a332-94408828c33a",
                _createdOn: 1721747885094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/11/37/outdoors-8903982_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-5-beige.webp", "../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-5-chartreuse.webp"],
                cat: "sportswear",
                subCat: "outdoors",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "cb3d2e2a-5014-4cfa-b5ff-da301ce8a5de": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "cb3d2e2a-5014-4cfa-b5ff-da301ce8a5de",
                _createdOn: 1721747886094,
                image: "https://cdn.pixabay.com/photo/2024/07/18/11/37/outdoors-8903981_960_720.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-6-crimson.webp", "../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-6-greenYellow.webp"],
                cat: "sportswear",
                subCat: "outdoors",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        bottoms_leggings: {
            "be737396-bf2d-4dec-a8c0-965e526eeb6d": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "be737396-bf2d-4dec-a8c0-965e526eeb6d",
                _createdOn: 1721747887094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/08/36/sport-8905746_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-1-white.webp", "../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-1-black.webp", "../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-1-blue.webp", "../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-1-red.webp"],
                cat: "sportswear",
                subCat: "bottoms_leggings",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "749f8a20-3a91-47ef-bb45-69d398560165": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "749f8a20-3a91-47ef-bb45-69d398560165",
                _createdOn: 1721747888094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/08/36/sport-8905745_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-2-yellow.webp", "../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-2-brown.webp"],
                cat: "sportswear",
                subCat: "bottoms_leggings",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "30a25db4-5c46-48c9-a225-93f74d895db7": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "30a25db4-5c46-48c9-a225-93f74d895db7",
                _createdOn: 1721747889094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/08/36/sport-8905744_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-3-green.webp", "../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-3-gray.webp"],
                cat: "sportswear",
                subCat: "bottoms_leggings",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "cbcd493f-889d-4c95-9740-8595bbadb6e6": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "cbcd493f-889d-4c95-9740-8595bbadb6e6",
                _createdOn: 1721747890094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/08/36/sport-8905742_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-4-pink.webp", "../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-4-orange.webp"],
                cat: "sportswear",
                subCat: "bottoms_leggings",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "220e7c6e-14c4-47ec-90bd-3fcea4386156": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "220e7c6e-14c4-47ec-90bd-3fcea4386156",
                _createdOn: 1721747891094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/08/36/sport-8905741_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-5-beige.webp", "../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-5-chartreuse.webp"],
                cat: "sportswear",
                subCat: "bottoms_leggings",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "d0057d1b-2ab9-44ce-a648-3348af3522cd": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "d0057d1b-2ab9-44ce-a648-3348af3522cd",
                _createdOn: 1721747892094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/08/36/sport-8905743_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-6-crimson.webp", "../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-6-greenYellow.webp"],
                cat: "sportswear",
                subCat: "bottoms_leggings",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        sweaters: {
            "82be02f5-41e2-42df-b013-30c66596fa03": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "82be02f5-41e2-42df-b013-30c66596fa03",
                _createdOn: 1721747893094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/12/03/clothes-8906158_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-1-white.webp", "../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-1-black.webp", "../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-1-blue.webp", "../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-1-red.webp"],
                cat: "sportswear",
                subCat: "sweaters",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "ff927916-6d5b-42b4-85af-522070f4cafa": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "ff927916-6d5b-42b4-85af-522070f4cafa",
                _createdOn: 1721747894094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/12/03/clothes-8906157__340.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-2-yellow.webp", "../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-2-brown.webp"],
                cat: "sportswear",
                subCat: "sweaters",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "6fc9e886-bf92-418d-bfb4-906cb11185e2": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "6fc9e886-bf92-418d-bfb4-906cb11185e2",
                _createdOn: 1721747895094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/12/03/clothes-8906156_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-3-green.webp", "../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-3-gray.webp"],
                cat: "sportswear",
                subCat: "sweaters",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "930f1cf0-9976-452b-b1b7-3eb5f6fe1297": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "930f1cf0-9976-452b-b1b7-3eb5f6fe1297",
                _createdOn: 1721747896094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/12/03/clothes-8906155_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-4-pink.webp", "../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-4-orange.webp"],
                cat: "sportswear",
                subCat: "sweaters",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "ed087cec-a8e2-4393-b687-fc9c8184d34c": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "ed087cec-a8e2-4393-b687-fc9c8184d34c",
                _createdOn: 1721747897094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/12/03/clothes-8906159_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-5-beige.webp", "../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-5-chartreuse.webp"],
                cat: "sportswear",
                subCat: "sweaters",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "2f02e9a6-d114-4bfd-bbc7-0f1c13ca5eef": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "2f02e9a6-d114-4bfd-bbc7-0f1c13ca5eef",
                _createdOn: 1721747898094,
                image: "https://cdn.pixabay.com/photo/2024/07/19/12/03/clothes-8906154_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-6-crimson.webp", "../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-6-greenYellow.webp"],
                cat: "sportswear",
                subCat: "sweaters",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        blazers_jackets: {
            "e7d022c5-1adf-4fb7-a66a-b03dac0b578f": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "e7d022c5-1adf-4fb7-a66a-b03dac0b578f",
                _createdOn: 1721752162912,
                image: "https://cdn.pixabay.com/photo/2024/07/23/16/19/jacket-8915751_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-1-white.webp", "../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-1-black.webp", "../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-1-blue.webp", "../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-1-red.webp"],
                cat: "suits_tailoring",
                subCat: "blazers_jackets",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "b484cd2a-34d7-431d-a127-33065192beea": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "b484cd2a-34d7-431d-a127-33065192beea",
                _createdOn: 1721752163912,
                image: "https://cdn.pixabay.com/photo/2024/07/23/16/19/jacket-8915750_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-2-yellow.webp", "../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-2-brown.webp"],
                cat: "suits_tailoring",
                subCat: "blazers_jackets",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "d3a62f1b-c2bf-49c9-8b13-cbc616a6c656": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "d3a62f1b-c2bf-49c9-8b13-cbc616a6c656",
                _createdOn: 1721752164912,
                image: "https://cdn.pixabay.com/photo/2024/07/23/16/19/jacket-8915749_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-3-green.webp", "../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-3-gray.webp"],
                cat: "suits_tailoring",
                subCat: "blazers_jackets",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "50c5a399-3e2d-4f5a-9e61-9782c7b9d282": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "50c5a399-3e2d-4f5a-9e61-9782c7b9d282",
                _createdOn: 1721752165912,
                image: "https://cdn.pixabay.com/photo/2024/07/23/16/19/jacket-8915748_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-4-pink.webp", "../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-4-orange.webp"],
                cat: "suits_tailoring",
                subCat: "blazers_jackets",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "dcc233b4-1e4e-4192-9465-ff044b12aaf8": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "dcc233b4-1e4e-4192-9465-ff044b12aaf8",
                _createdOn: 1721752166912,
                image: "https://cdn.pixabay.com/photo/2024/07/23/16/19/jacket-8915747_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-5-beige.webp", "../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-5-chartreuse.webp"],
                cat: "suits_tailoring",
                subCat: "blazers_jackets",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "f0c26045-329c-47b3-92e2-f6bc025d237d": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "f0c26045-329c-47b3-92e2-f6bc025d237d",
                _createdOn: 1721752167912,
                image: "https://cdn.pixabay.com/photo/2024/07/23/16/19/jacket-8915746_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-6-crimson.webp", "../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-6-greenYellow.webp"],
                cat: "suits_tailoring",
                subCat: "blazers_jackets",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        waistcoats: {
            "08f4dcb7-a42c-4441-850f-afecea721205": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "08f4dcb7-a42c-4441-850f-afecea721205",
                _createdOn: 1721797920893,
                image: "https://cdn.pixabay.com/photo/2024/07/24/04/57/waistcoat-8916941_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-1-white.webp", "../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-1-black.webp", "../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-1-blue.webp", "../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-1-red.webp"],
                cat: "suits_tailoring",
                subCat: "waistcoats",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "22213ca0-1ca9-4e12-9bd8-563553713e02": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "22213ca0-1ca9-4e12-9bd8-563553713e02",
                _createdOn: 1721797921893,
                image: "https://cdn.pixabay.com/photo/2024/07/24/04/57/waistcoat-8916939_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-2-yellow.webp", "../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-2-brown.webp"],
                cat: "suits_tailoring",
                subCat: "waistcoats",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "7b2d831c-e578-4101-a354-08952eb66df4": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "7b2d831c-e578-4101-a354-08952eb66df4",
                _createdOn: 1721797922893,
                image: "https://cdn.pixabay.com/photo/2024/07/24/04/57/waistcoat-8916940_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-3-green.webp", "../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-3-gray.webp"],
                cat: "suits_tailoring",
                subCat: "waistcoats",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "1f89964e-de86-4a3d-b55e-e8a0030d4530": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "1f89964e-de86-4a3d-b55e-e8a0030d4530",
                _createdOn: 1721797923893,
                image: "https://cdn.pixabay.com/photo/2024/07/24/04/57/waistcoat-8916938_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-4-pink.webp", "../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-4-orange.webp"],
                cat: "suits_tailoring",
                subCat: "waistcoats",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "0d2e3f86-2879-43cf-825a-89505985b57a": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "0d2e3f86-2879-43cf-825a-89505985b57a",
                _createdOn: 1721797924893,
                image: "https://cdn.pixabay.com/photo/2024/07/24/04/57/waistcoat-8916936_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-5-beige.webp", "../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-5-chartreuse.webp"],
                cat: "suits_tailoring",
                subCat: "waistcoats",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "e5d056e1-01bf-4f17-a57e-ea58f802f860": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "e5d056e1-01bf-4f17-a57e-ea58f802f860",
                _createdOn: 1721797925893,
                image: "https://cdn.pixabay.com/photo/2024/07/24/04/57/waistcoat-8916937__340.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-6-crimson.webp", "../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-6-greenYellow.webp"],
                cat: "suits_tailoring",
                subCat: "waistcoats",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        tuxedos_partywear: {
            "60164470-b1df-41e7-bfd3-e0b4aecea7dc": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "60164470-b1df-41e7-bfd3-e0b4aecea7dc",
                _createdOn: 1721895758193,
                image: "https://cdn.pixabay.com/photo/2024/07/25/07/46/tuxedo-8920416_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-1-white.webp", "../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-1-black.webp", "../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-1-blue.webp", "../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-1-red.webp"],
                cat: "suits_tailoring",
                subCat: "tuxedos_partywear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "333ccc5a-4f6f-4926-8456-ae8a9d7a314b": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "333ccc5a-4f6f-4926-8456-ae8a9d7a314b",
                _createdOn: 1721895759193,
                image: "https://cdn.pixabay.com/photo/2024/07/25/07/46/tuxedo-8920415_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-2-yellow.webp", "../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-2-brown.webp"],
                cat: "suits_tailoring",
                subCat: "tuxedos_partywear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "e723574f-041f-47aa-a8a9-2c4065cb17d9": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "e723574f-041f-47aa-a8a9-2c4065cb17d9",
                _createdOn: 1721895760193,
                image: "https://cdn.pixabay.com/photo/2024/07/25/07/46/tuxedo-8920414_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-3-green.webp", "../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-3-gray.webp"],
                cat: "suits_tailoring",
                subCat: "tuxedos_partywear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "0e0069e7-965d-4a63-8ad8-8f0d84c4a94f": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "0e0069e7-965d-4a63-8ad8-8f0d84c4a94f",
                _createdOn: 1721895761193,
                image: "https://cdn.pixabay.com/photo/2024/07/25/07/46/dress-8920412_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-4-pink.webp", "../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-4-orange.webp"],
                cat: "suits_tailoring",
                subCat: "tuxedos_partywear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "18f99028-862d-4f0d-8fa5-eabcdac35c4d": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "18f99028-862d-4f0d-8fa5-eabcdac35c4d",
                _createdOn: 1721895762193,
                image: "https://cdn.pixabay.com/photo/2024/07/25/07/46/dress-8920413_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-5-beige.webp", "../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-5-chartreuse.webp"],
                cat: "suits_tailoring",
                subCat: "tuxedos_partywear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "55b469f8-eed6-4efa-ab32-1888b604b777": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "55b469f8-eed6-4efa-ab32-1888b604b777",
                _createdOn: 1721895763193,
                image: "https://cdn.pixabay.com/photo/2024/07/25/07/46/dress-8920411_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-6-crimson.webp", "../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-6-greenYellow.webp"],
                cat: "suits_tailoring",
                subCat: "tuxedos_partywear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        ties: {
            "84643b15-f233-4b80-ba77-ea6a1834f154": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "84643b15-f233-4b80-ba77-ea6a1834f154",
                _createdOn: 1721903383193,
                image: "https://cdn.pixabay.com/photo/2024/07/25/10/14/neckties-8920678_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-1-white.webp", "../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-1-black.webp", "../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-1-blue.webp", "../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-1-red.webp"],
                cat: "suits_tailoring",
                subCat: "ties",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "2792c835-6429-4cf0-bca5-a24be7483a21": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "2792c835-6429-4cf0-bca5-a24be7483a21",
                _createdOn: 1721903384193,
                image: "https://cdn.pixabay.com/photo/2024/07/25/10/14/neckties-8920677_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-2-yellow.webp", "../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-2-brown.webp"],
                cat: "suits_tailoring",
                subCat: "ties",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "bd3ddc02-4641-4370-a29c-71277f341970": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "bd3ddc02-4641-4370-a29c-71277f341970",
                _createdOn: 1721903385193,
                image: "https://cdn.pixabay.com/photo/2024/07/25/10/14/neckties-8920680_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-3-green.webp", "../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-3-gray.webp"],
                cat: "suits_tailoring",
                subCat: "ties",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "f971f068-de3b-4e87-9dd4-3c1e69bd0285": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "f971f068-de3b-4e87-9dd4-3c1e69bd0285",
                _createdOn: 1721903386193,
                image: "https://cdn.pixabay.com/photo/2024/07/25/10/14/neckties-8920675_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-4-pink.webp", "../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-4-orange.webp"],
                cat: "suits_tailoring",
                subCat: "ties",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "63b9d741-25f6-4437-8dcb-4311dc8b08ca": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "63b9d741-25f6-4437-8dcb-4311dc8b08ca",
                _createdOn: 1721903387193,
                image: "https://cdn.pixabay.com/photo/2024/07/25/10/14/neckties-8920676_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-5-beige.webp", "../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-5-chartreuse.webp"],
                cat: "suits_tailoring",
                subCat: "ties",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "978da206-c1a1-4ace-b8a9-de0049042c72": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "978da206-c1a1-4ace-b8a9-de0049042c72",
                _createdOn: 1721903388193,
                image: "https://cdn.pixabay.com/photo/2024/07/25/10/14/neckties-8920679_640.jpg",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-6-crimson.webp", "../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-6-greenYellow.webp"],
                cat: "suits_tailoring",
                subCat: "ties",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        workwear: {
            "48ba30c0-9772-4e5d-9047-d276a26da77f": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "48ba30c0-9772-4e5d-9047-d276a26da77f",
                _createdOn: 1736860869218,
                image: "../../../assets/public/static/images/catalog/suits_tailoring/workwear/workwear-1.webp",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/workwear/colors/workwear-1-white.webp", "../../../assets/public/static/images/catalog/suits_tailoring/workwear/colors/workwear-1-black.webp", "../../../assets/public/static/images/catalog/suits_tailoring/workwear/colors/workwear-1-blue.webp", "../../../assets/public/static/images/catalog/suits_tailoring/workwear/colors/workwear-1-red.webp"],
                cat: "suits_tailoring",
                subCat: "workwear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["white", "black", "blue", "red"],
                brand: "Fusce vel",
                quantity: 15,
                price: 47,
            },
            "2432a46a-8cbc-412e-82be-c61789394083": {
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _id: "2432a46a-8cbc-412e-82be-c61789394083",
                _createdOn: 1736861646070,
                image: "../../../assets/public/static/images/catalog/suits_tailoring/workwear/workwear-2.webp",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/workwear/colors/workwear-2-yellow.webp", "../../../assets/public/static/images/catalog/suits_tailoring/workwear/colors/workwear-2-brown.webp"],
                cat: "suits_tailoring",
                subCat: "workwear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "L"],
                color: ["yellow", "brown"],
                brand: "Fusce vel",
                quantity: 10,
                price: 40,
            },
            "b088a4b8-9542-49a4-9c7e-3402d021b740": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "b088a4b8-9542-49a4-9c7e-3402d021b740",
                _createdOn: 1736861905251,
                image: "../../../assets/public/static/images/catalog/suits_tailoring/workwear/workwear-3.webp",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/workwear/colors/workwear-3-green.webp", "../../../assets/public/static/images/catalog/suits_tailoring/workwear/colors/workwear-3-gray.webp"],
                cat: "suits_tailoring",
                subCat: "workwear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "S"],
                color: ["green", "gray"],
                brand: "Fusce vel",
                quantity: 20,
                price: 50,
            },
            "9f25e94d-e1d3-41ed-8ec4-5f3fdf6479b0": {
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "9f25e94d-e1d3-41ed-8ec4-5f3fdf6479b0",
                _createdOn: 1736862199055,
                image: "../../../assets/public/static/images/catalog/suits_tailoring/workwear/workwear-4.webp",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/workwear/colors/workwear-4-pink.webp", "../../../assets/public/static/images/catalog/suits_tailoring/workwear/colors/workwear-4-orange.webp"],
                cat: "suits_tailoring",
                subCat: "workwear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["XS", "M", "L", "XL"],
                color: ["pink", "orange"],
                brand: "Fusce vel",
                quantity: 25,
                price: 33,
            },
            "e8217ea3-8e8c-4113-9895-e0c1ae8a96de": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "e8217ea3-8e8c-4113-9895-e0c1ae8a96de",
                _createdOn: 1736862458917,
                image: "../../../assets/public/static/images/catalog/suits_tailoring/workwear/workwear-5.webp",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/workwear/colors/workwear-5-beige.webp", "../../../assets/public/static/images/catalog/suits_tailoring/workwear/colors/workwear-5-chartreuse.webp"],
                cat: "suits_tailoring",
                subCat: "workwear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["M", "L", "XXL"],
                color: ["beige", "chartreuse"],
                brand: "Fusce vel",
                quantity: 27,
                price: 21,
            },
            "8a45c672-3769-4642-8643-fc5b39b38850": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "8a45c672-3769-4642-8643-fc5b39b38850",
                _createdOn: 1736862777946,
                image: "../../../assets/public/static/images/catalog/suits_tailoring/workwear/workwear-6.webp",
                altImages: ["../../../assets/public/static/images/catalog/suits_tailoring/workwear/colors/workwear-6-crimson.webp", "../../../assets/public/static/images/catalog/suits_tailoring/workwear/colors/workwear-6-greenYellow.webp"],
                cat: "suits_tailoring",
                subCat: "workwear",
                description: "Lorem ipsum dolor sit amet....",
                size: ["S", "M", "L"],
                color: ["crimson", "greenYellow"],
                brand: "Fusce vel",
                quantity: 44,
                price: 56,
            }
        },
        discounts: {
            "e8ca1e74-fa75-4445-b67c-a23800a5ab1c": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "e8ca1e74-fa75-4445-b67c-a23800a5ab1c",
                code: "discount code",
                rate: 0
            },
            "1f606895-b967-441c-9b11-9a166cc1063e": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "1f606895-b967-441c-9b11-9a166cc1063e",
                code: "WINTERSALE -25%",
                rate: 25
            },
            "7435b1f6-4567-44e6-a00b-d515185a67ce": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "7435b1f6-4567-44e6-a00b-d515185a67ce",
                code: "SPRINGSALE -10%",
                rate: 10
            },
            "39097456-348f-40f3-8849-98dc5fcaf06b": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "39097456-348f-40f3-8849-98dc5fcaf06b",
                code: "EASTERSALE -50%",
                rate: 50
            },
            "7a03796c-e633-4318-9f1c-be93fef697bf": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "7a03796c-e633-4318-9f1c-be93fef697bf",
                code: "SUMMERSALE -25%",
                rate: 25
            },
            "6c040ccd-3338-4f5c-ab12-9c6b1a25c025": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "6c040ccd-3338-4f5c-ab12-9c6b1a25c025",
                code: "AUTUMNSALE -15%",
                rate: 15
            },
            "33d1369a-1ca2-4f2c-9b93-64288bfe175e": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "33d1369a-1ca2-4f2c-9b93-64288bfe175e",
                code: "NEWYEARSALE -50%",
                rate: 50
            }
        },
        shipping: {
            "3317dcb4-b951-4ff6-a422-b027a6ff4cd2": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "3317dcb4-b951-4ff6-a422-b027a6ff4cd2",
                name: "shipping method",
                value: 0
            },
            "bae9cfd4-0d29-4713-ae8a-dfd4a0aa23db": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "bae9cfd4-0d29-4713-ae8a-dfd4a0aa23db",
                name: "economic 7$",
                value: 7
            },
            "5558d210-c329-4cc9-aecf-f72594b8caa8": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "5558d210-c329-4cc9-aecf-f72594b8caa8",
                name: "standard 10$",
                value: 10
            },
            "882e509f-7939-43b5-8765-d39385ed7cca": {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "882e509f-7939-43b5-8765-d39385ed7cca",
                name: "premium 15$",
                value: 15
            }
        },
        orders: {
            "c9370d81-bbc9-4fe9-b6c4-cb9313dfa677": {
                _createdOn: 1729856211104,
                _id: "c9370d81-bbc9-4fe9-b6c4-cb9313dfa677",
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                email: "peter@abv.bg",
                username: "Peter",
                address: {
                    phone: "+1-415-123456",
                    street_building: "1355 Market St, Suite 900",
                    city: "San Francisco",
                    region: "California",
                    postalCode: "CA 94103",
                    country: "USA"
                },
                subtotal: 63,
                discount: {
                    code: "NEWYEARSALE -50%",
                    rate: 50
                },
                discountValue: 31.5,
                shippingMethod: {
                    name: "economic 7$",
                    value: 7
                },
                shippingValue: 7,
                total: 38.5,
                paymentState: "paid",
                status: "pending",
                referenceNumber: "192c37708a0",
                _updatedOn: 1729856323562
            },
            "cc2055f3-57b0-4deb-879a-1351bc920f98": {
                _createdOn: 1729860342360,
                _id: "cc2055f3-57b0-4deb-879a-1351bc920f98",
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                email: "peter@abv.bg",
                username: "Peter",
                address: {
                    phone: "+1-415-123456",
                    street_building: "1355 Market St, Suite 900",
                    city: "San Francisco",
                    region: "California",
                    postalCode: "CA 94103",
                    country: "USA"
                },
                subtotal: 63,
                discount: {
                    code: "EASTERSALE -50%",
                    rate: 50
                },
                discountValue: 31.5,
                shippingMethod: {
                    name: "standard 10$",
                    value: 10
                },
                shippingValue: 10,
                total: 41.5,
                paymentState: "paid",
                status: "pending",
                referenceNumber: "192c3b61258",
                _updatedOn: 1729860438657
            },
            "89ae512e-abc8-42d1-b371-58ad63e3c8b6": {
                _createdOn: 1729862173771,
                _id: "89ae512e-abc8-42d1-b371-58ad63e3c8b6",
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                email: "george@abv.bg",
                username: "George",
                address: {
                    phone: "+1-415-123456",
                    street_building: "1355 Market St, Suite 900",
                    city: "San Francisco",
                    region: "California",
                    postalCode: "CA 94103",
                    country: "USA"
                },
                subtotal: 63,
                discount: {
                    code: "WINTERSALE -25%",
                    rate: 25
                },
                discountValue: 15.75,
                shippingMethod: {
                    name: "premium 15$",
                    value: 15
                },
                shippingValue: 15,
                total: 62.25,
                paymentState: "paid",
                status: "pending",
                referenceNumber: "192c3d2044b",
                _updatedOn: 1729862283569
            },
            "7a7790fa-bb37-4450-80d0-679ad90f3e5c": {
                _createdOn: 1729863132438,
                _id: "7a7790fa-bb37-4450-80d0-679ad90f3e5c",
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                email: "george@abv.bg",
                username: "George",
                address: {
                    phone: "+1-415-123456",
                    street_building: "1355 Market St, Suite 900",
                    city: "San Francisco",
                    region: "California",
                    postalCode: "CA 94103",
                    country: "USA"
                },
                subtotal: 63,
                discount: {
                    code: "SUMMERSALE -25%",
                    rate: 25
                },
                discountValue: 15.75,
                shippingMethod: {
                    name: "economic 7$",
                    value: 7
                },
                shippingValue: 7,
                total: 54.25,
                paymentState: "paid",
                status: "pending",
                referenceNumber: "192c3e0a516",
                _updatedOn: 1729863234784
            },
            "b6a57bc0-751b-45aa-8598-aa4e7f6b9079": {
                _createdOn: 1729932916273,
                _id: "b6a57bc0-751b-45aa-8598-aa4e7f6b9079",
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                email: "admin@abv.bg",
                username: "Admin",
                address: {
                    phone: "+1-415-123456",
                    street_building: "1355 Market St, Suite 900",
                    city: "San Francisco",
                    region: "California",
                    postalCode: "CA 94103",
                    country: "USA"
                },
                subtotal: 99,
                discount: {
                    code: "EASTERSALE -50%",
                    rate: 50
                },
                discountValue: 49.5,
                shippingMethod: {
                    name: "economic 7$",
                    value: 7
                },
                shippingValue: 7,
                total: 56.5,
                paymentState: "paid",
                status: "pending",
                referenceNumber: "192c8097631",
                _updatedOn: 1729933762290
            },
            "440cc882-0694-4ad7-8529-1a25cf6b3465": {
                _createdOn: 1729935169866,
                _id: "440cc882-0694-4ad7-8529-1a25cf6b3465",
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                email: "admin@abv.bg",
                username: "Admin",
                address: {
                    phone: "+1-415-123456",
                    street_building: "1355 Market St, Suite 900",
                    city: "San Francisco",
                    region: "California",
                    postalCode: "CA 94103",
                    country: "USA"
                },
                subtotal: 104,
                discount: {
                    code: "EASTERSALE -50%",
                    rate: 50
                },
                discountValue: 52,
                shippingMethod: {
                    name: "economic 7$",
                    value: 7
                },
                shippingValue: 7,
                total: 59,
                paymentState: "paid",
                status: "pending",
                referenceNumber: "192c82bd94a",
                _updatedOn: 1729935362703
            }
        },
        traded_items: {
            "4b02503c-c92c-4d03-9cd2-ccd6cdbb8557": {
                orderId: "b6a57bc0-751b-45aa-8598-aa4e7f6b9079",
                stockId: "1f89964e-de86-4a3d-b55e-e8a0030d4530",
                sellerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "4b02503c-c92c-4d03-9cd2-ccd6cdbb8557",
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _createdOn: 1731001470649,
                image: "https://cdn.pixabay.com/photo/2024/07/24/04/57/waistcoat-8916938_640.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-4-pink.webp",
                    "../../../assets/public/static/images/catalog/suits_tailoring/waistcoats/colors/waistcoats-4-orange.webp"
                ],
                cat: "suits_tailoring",
                subCat: "waistcoats",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    "XS",
                    "M",
                    "L",
                    "XL"
                ],
                selectedSize: "XS",
                color: [
                    "pink",
                    "orange"
                ],
                selectedColor: "orange",
                quantity: 25,
                selectedQuantity: 1,
                price: 33,
                product: 33,
                checked: false,
                status: 'pending'
            },
            "5ccbd6d6-68bd-4cae-8933-ecca814ead46": {
                orderId: "b6a57bc0-751b-45aa-8598-aa4e7f6b9079",
                stockId: "50c5a399-3e2d-4f5a-9e61-9782c7b9d282",
                sellerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "5ccbd6d6-68bd-4cae-8933-ecca814ead46",
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _createdOn: 1731001816838,
                image: "https://cdn.pixabay.com/photo/2024/07/23/16/19/jacket-8915748_640.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-4-pink.webp",
                    "../../../assets/public/static/images/catalog/suits_tailoring/blazers_jackets/colors/blazers_jackets-4-orange.webp"
                ],
                cat: "suits_tailoring",
                subCat: "blazers_jackets",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    "XS",
                    "M",
                    "L",
                    "XL"
                ],
                selectedSize: "M",
                color: [
                    "pink",
                    "orange"
                ],
                selectedColor: "pink",
                quantity: 25,
                selectedQuantity: 1,
                price: 33,
                product: 33,
                checked: false,
                status: 'pending'
            },
            "d91eaacc-64ce-42f4-8cc2-8bf4f2c3500c": {
                orderId: "b6a57bc0-751b-45aa-8598-aa4e7f6b9079",
                stockId: "2c02cf71-206b-40a3-a099-92ab9a51d018",
                sellerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "d91eaacc-64ce-42f4-8cc2-8bf4f2c3500c",
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _createdOn: 1731001914094,
                image: "https://cdn.pixabay.com/photo/2018/01/18/19/06/time-3091031_960_720.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/accessories/watches/colors/watches-4-pink.webp",
                    "../../../assets/public/static/images/catalog/accessories/watches/colors/watches-4-orange.webp"
                ],
                cat: "accessories",
                subCat: "watches",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    22,
                    24,
                    26,
                    28
                ],
                selectedSize: "26",
                color: [
                    "pink",
                    "orange"
                ],
                selectedColor: "orange",
                quantity: 25,
                selectedQuantity: 1,
                price: 33,
                product: 33,
                checked: false,
                status: 'pending'
            },
            "2aca21d2-8d55-4918-bc94-ea30c53bead2": {
                orderId: "440cc882-0694-4ad7-8529-1a25cf6b3465",
                stockId: "cc515c51-25e2-4f9f-b552-dc315b1652d7",
                sellerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "2aca21d2-8d55-4918-bc94-ea30c53bead2",
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _createdOn: 1731002006609,
                image: "https://cdn.pixabay.com/photo/2021/06/18/10/30/cap-6345767_960_720.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-3-green.webp",
                    "../../../assets/public/static/images/catalog/accessories/caps_hats/colors/caps_hats-3-gray.webp"
                ],
                cat: "accessories",
                subCat: "caps_hats",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    "XS",
                    "S"
                ],
                selectedSize: "XS",
                color: [
                    "green",
                    "gray"
                ],
                selectedColor: "green",
                quantity: 7,
                selectedQuantity: 1,
                price: 38,
                product: 38,
                checked: false,
                status: 'pending'
            },
            "0de7091f-bc18-4822-9c84-ffb3b9a8b39c": {
                orderId: "440cc882-0694-4ad7-8529-1a25cf6b3465",
                stockId: "8e7979ce-50f7-41e7-9bc6-12af5e692516",
                sellerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "0de7091f-bc18-4822-9c84-ffb3b9a8b39c",
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _createdOn: 1731002239677,
                image: "https://cdn.pixabay.com/photo/2021/02/02/08/48/belt-5973152_960_720.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/accessories/belts/colors/belts-4-pink.webp",
                    "../../../assets/public/static/images/catalog/accessories/belts/colors/belts-4-orange.webp"
                ],
                cat: "accessories",
                subCat: "belts",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    27,
                    28,
                    29,
                    30
                ],
                selectedSize: "28",
                color: [
                    "pink",
                    "orange"
                ],
                selectedColor: "pink",
                quantity: 25,
                selectedQuantity: 1,
                price: 33,
                product: 33,
                checked: false,
                status: 'pending'
            },
            "3bc75db4-1d29-46ba-98ce-95cd1930bbf2": {
                orderId: "440cc882-0694-4ad7-8529-1a25cf6b3465",
                stockId: "299d18f0-6bf2-4605-8a00-82b9da04d2e6",
                sellerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _id: "3bc75db4-1d29-46ba-98ce-95cd1930bbf2",
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _createdOn: 1731002663458,
                image: "https://cdn.pixabay.com/photo/2021/04/26/13/34/gloves-6208920_960_720.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-4-pink.webp",
                    "../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-4-orange.webp"
                ],
                cat: "accessories",
                subCat: "gloves",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    7,
                    7.5,
                    8.5,
                    10
                ],
                selectedSize: "7.5",
                color: [
                    "pink",
                    "orange"
                ],
                selectedColor: "orange",
                quantity: 25,
                selectedQuantity: 1,
                price: 33,
                product: 33,
                checked: false,
                status: 'pending'
            },
            "c6817c72-4899-4d2c-ad4f-963835af0025": {
                orderId: "c9370d81-bbc9-4fe9-b6c4-cb9313dfa677",
                stockId: "572883fb-4f2e-443e-8bd9-280fc1072fa6",
                sellerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "c6817c72-4899-4d2c-ad4f-963835af0025",
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _createdOn: 1731002823958,
                image: "https://cdn.pixabay.com/photo/2018/06/26/13/29/belt-buckle-3499410_960_720.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/accessories/belts/colors/belts-5-beige.webp",
                    "../../../assets/public/static/images/catalog/accessories/belts/colors/belts-5-chartreuse.webp"
                ],
                cat: "accessories",
                subCat: "belts",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    30,
                    32,
                    34,
                    36
                ],
                selectedSize: "30",
                color: [
                    "beige",
                    "chartreuse"
                ],
                selectedColor: "beige",
                quantity: 27,
                selectedQuantity: 1,
                price: 21,
                product: 21,
                checked: false,
                status: 'pending'
            },
            "2098a22f-99e0-4dfa-bf43-a0ec68d952c4": {
                orderId: "c9370d81-bbc9-4fe9-b6c4-cb9313dfa677",
                stockId: "cc73d130-210a-4e79-8d7a-7b200ed4170d",
                sellerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "2098a22f-99e0-4dfa-bf43-a0ec68d952c4",
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _createdOn: 1731002928258,
                image: "https://cdn.pixabay.com/photo/2016/02/11/20/21/mens-leather-gloves-1194450_960_720.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-5-beige.webp",
                    "../../../assets/public/static/images/catalog/accessories/gloves/colors/gloves-5-chartreuse.webp"
                ],
                cat: "accessories",
                subCat: "gloves",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    8,
                    8.5,
                    9.5,
                    10
                ],
                selectedSize: "8",
                color: [
                    "beige",
                    "chartreuse"
                ],
                selectedColor: "chartreuse",
                quantity: 27,
                selectedQuantity: 1,
                price: 21,
                product: 21,
                checked: false,
                status: 'pending'
            },
            "51914ce8-eaf7-4e77-aaa5-5fa1e8b8a66f": {
                orderId: "c9370d81-bbc9-4fe9-b6c4-cb9313dfa677",
                stockId: "af7a58f3-bb9d-4a09-9395-bfc124d6de37",
                sellerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "51914ce8-eaf7-4e77-aaa5-5fa1e8b8a66f",
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _createdOn: 1731003007684,
                image: "https://cdn.pixabay.com/photo/2015/07/22/21/24/oakley-856122_960_720.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-5-beige.webp",
                    "../../../assets/public/static/images/catalog/accessories/sunglasses/colors/sunglasses-5-chartreuse.webp"
                ],
                cat: "accessories",
                subCat: "sunglasses",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    "M",
                    "L",
                    "XXL"
                ],
                selectedSize: "M",
                color: [
                    "beige",
                    "chartreuse"
                ],
                selectedColor: "beige",
                quantity: 14,
                selectedQuantity: 1,
                price: 21,
                product: 21,
                checked: false,
                status: 'pending'
            },
            "438e8829-1429-4ac9-b8ea-50dafa2aa5ba": {
                orderId: "cc2055f3-57b0-4deb-879a-1351bc920f98",
                stockId: "220e7c6e-14c4-47ec-90bd-3fcea4386156",
                sellerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "438e8829-1429-4ac9-b8ea-50dafa2aa5ba",
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _createdOn: 1731003132436,
                image: "https://cdn.pixabay.com/photo/2024/07/19/08/36/sport-8905741_640.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-5-beige.webp",
                    "../../../assets/public/static/images/catalog/sportswear/bottoms_leggings/colors/bottoms_leggings-5-chartreuse.webp"
                ],
                cat: "sportswear",
                subCat: "bottoms_leggings",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    "M",
                    "L",
                    "XXL"
                ],
                selectedSize: "M",
                color: [
                    "beige",
                    "chartreuse"
                ],
                selectedColor: "chartreuse",
                quantity: 27,
                selectedQuantity: 1,
                price: 21,
                product: 21,
                checked: false,
                status: 'pending'
            },
            "cf1dfe48-f553-4d83-bf34-04cb29a26586": {
                orderId: "cc2055f3-57b0-4deb-879a-1351bc920f98",
                stockId: "c7c585fe-3529-4bda-a332-94408828c33a",
                sellerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "cf1dfe48-f553-4d83-bf34-04cb29a26586",
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _createdOn: 1731003267617,
                image: "https://cdn.pixabay.com/photo/2024/07/18/11/37/outdoors-8903982_960_720.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-5-beige.webp",
                    "../../../assets/public/static/images/catalog/sportswear/outdoors/colors/outdoors-5-chartreuse.webp"
                ],
                cat: "sportswear",
                subCat: "outdoors",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    "M",
                    "L",
                    "XXL"
                ],
                selectedSize: "M",
                color: [
                    "beige",
                    "chartreuse"
                ],
                selectedColor: "beige",
                quantity: 27,
                selectedQuantity: 1,
                price: 21,
                product: 21,
                checked: false,
                status: 'pending'
            },
            "0c205237-871d-47ca-9688-95124d27c0a3": {
                orderId: "cc2055f3-57b0-4deb-879a-1351bc920f98",
                stockId: "ebde504e-796e-4a62-948a-d0421a113000",
                sellerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "0c205237-871d-47ca-9688-95124d27c0a3",
                _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
                _createdOn: 1731003328681,
                image: "https://cdn.pixabay.com/photo/2024/07/17/20/40/fitness-8902499_960_720.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/sportswear/running/colors/running-5-beige.webp",
                    "../../../assets/public/static/images/catalog/sportswear/running/colors/running-5-chartreuse.webp"
                ],
                cat: "sportswear",
                subCat: "running",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    "M",
                    "L",
                    "XXL"
                ],
                selectedSize: "M",
                color: [
                    "beige",
                    "chartreuse"
                ],
                selectedColor: "chartreuse",
                quantity: 27,
                selectedQuantity: 1,
                price: 21,
                product: 21,
                checked: false,
                status: 'pending'
            },
            "35ae6855-7773-4e5c-ae26-3c8fab5e7d44": {
                orderId: "89ae512e-abc8-42d1-b371-58ad63e3c8b6",
                stockId: "63b9d741-25f6-4437-8dcb-4311dc8b08ca",
                sellerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "35ae6855-7773-4e5c-ae26-3c8fab5e7d44",
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _createdOn: 1731003456011,
                image: "https://cdn.pixabay.com/photo/2024/07/25/10/14/neckties-8920676_640.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-5-beige.webp",
                    "../../../assets/public/static/images/catalog/suits_tailoring/ties/colors/ties-5-chartreuse.webp"
                ],
                cat: "suits_tailoring",
                subCat: "ties",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    "M",
                    "L",
                    "XXL"
                ],
                selectedSize: "M",
                color: [
                    "beige",
                    "chartreuse"
                ],
                selectedColor: "beige",
                quantity: 27,
                selectedQuantity: 1,
                price: 21,
                product: 21,
                checked: false,
                status: 'pending'
            },
            "dfa9b995-d525-4e94-9243-88d2d8358fbb": {
                orderId: "89ae512e-abc8-42d1-b371-58ad63e3c8b6",
                stockId: "18f99028-862d-4f0d-8fa5-eabcdac35c4d",
                sellerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "dfa9b995-d525-4e94-9243-88d2d8358fbb",
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _createdOn: 1731003527226,
                image: "https://cdn.pixabay.com/photo/2024/07/25/07/46/dress-8920413_640.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-5-beige.webp",
                    "../../../assets/public/static/images/catalog/suits_tailoring/tuxedos_partywear/colors/tuxedos_partywear-5-chartreuse.webp"
                ],
                cat: "suits_tailoring",
                subCat: "tuxedos_partywear",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    "M",
                    "L",
                    "XXL"
                ],
                selectedSize: "M",
                color: [
                    "beige",
                    "chartreuse"
                ],
                selectedColor: "chartreuse",
                quantity: 27,
                selectedQuantity: 1,
                price: 21,
                product: 21,
                checked: false,
                status: 'pending'
            },
            "a5efd236-958a-4203-8fb6-a7f638dd015c": {
                orderId: "89ae512e-abc8-42d1-b371-58ad63e3c8b6",
                stockId: "ed087cec-a8e2-4393-b687-fc9c8184d34c",
                sellerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "a5efd236-958a-4203-8fb6-a7f638dd015c",
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _createdOn: 1731003601385,
                image: "https://cdn.pixabay.com/photo/2024/07/19/12/03/clothes-8906159_640.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-5-beige.webp",
                    "../../../assets/public/static/images/catalog/sportswear/sweaters/colors/sweaters-5-chartreuse.webp"
                ],
                cat: "sportswear",
                subCat: "sweaters",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    "M",
                    "L",
                    "XXL"
                ],
                selectedSize: "XXL",
                color: [
                    "beige",
                    "chartreuse"
                ],
                selectedColor: "beige",
                quantity: 27,
                selectedQuantity: 1,
                price: 21,
                product: 21,
                checked: false,
                status: 'pending'
            },
            "372746b5-922a-4378-9a62-91ded0948d2d": {
                orderId: "7a7790fa-bb37-4450-80d0-679ad90f3e5c",
                stockId: "6d23eba6-cae8-488e-9395-4a8a763fbcda",
                sellerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "372746b5-922a-4378-9a62-91ded0948d2d",
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _createdOn: 1731003694248,
                image: "https://cdn.pixabay.com/photo/2020/06/29/04/33/shoes-5351339_960_720.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-5-beige.webp",
                    "../../../assets/public/static/images/catalog/shoes/trainers/colors/trainers-5-chartreuse.webp"
                ],
                cat: "shoes",
                subCat: "trainers",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    8,
                    8.5,
                    9.5,
                    10
                ],
                selectedSize: "8",
                color: [
                    "beige",
                    "chartreuse"
                ],
                selectedColor: "chartreuse",
                quantity: 27,
                selectedQuantity: 1,
                price: 21,
                product: 21,
                checked: false,
                status: 'pending'
            },
            "0282dac5-f5ed-44e3-8392-0c61c1d70dab": {
                orderId: "7a7790fa-bb37-4450-80d0-679ad90f3e5c",
                stockId: "082fdb17-114d-414e-af85-7ce902fed3f8",
                sellerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "0282dac5-f5ed-44e3-8392-0c61c1d70dab",
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _createdOn: 1731003779777,
                image: "https://cdn.pixabay.com/photo/2018/12/10/21/34/winter-boots-3867776_960_720.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/shoes/boots/colors/boots-5-beige.webp",
                    "../../../assets/public/static/images/catalog/shoes/boots/colors/boots-5-chartreuse.webp"
                ],
                cat: "shoes",
                subCat: "boots",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    8,
                    8.5,
                    9.5,
                    10
                ],
                selectedSize: "10",
                color: [
                    "beige",
                    "chartreuse"
                ],
                selectedColor: "beige",
                quantity: 27,
                selectedQuantity: 1,
                price: 21,
                product: 21,
                checked: false,
                status: 'pending'
            },
            "53c31640-7b4b-44aa-940a-2989be017983": {
                orderId: "7a7790fa-bb37-4450-80d0-679ad90f3e5c",
                stockId: "140b3d37-e2e6-4c7a-8567-da67d82b7c74",
                sellerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                _id: "53c31640-7b4b-44aa-940a-2989be017983",
                _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
                _createdOn: 1731003868011,
                image: "https://cdn.pixabay.com/photo/2015/01/21/01/27/slippers-606277_960_720.jpg",
                altImages: [
                    "../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-5-beige.webp",
                    "../../../assets/public/static/images/catalog/shoes/slippers/colors/slippers-5-chartreuse.webp"
                ],
                cat: "shoes",
                subCat: "slippers",
                description: "Lorem ipsum dolor sit amet....",
                brand: "Fusce vel",
                size: [
                    8,
                    8.5,
                    9.5,
                    10
                ],
                selectedSize: "9.5",
                color: [
                    "beige",
                    "chartreuse"
                ],
                selectedColor: "chartreuse",
                quantity: 27,
                selectedQuantity: 1,
                price: 21,
                product: 21,
                checked: false,
                status: 'pending'
            }
        }
    };
    var rules$1 = {
        users: {
            ".create": false,
            ".read": [
                "Owner"
            ],
            ".update": false,
            ".delete": false
        },
        members: {
            ".update": "isOwner(user, get('teams', data.teamId))",
            ".delete": "isOwner(user, get('teams', data.teamId)) || isOwner(user, data)",
            "*": {
                teamId: {
                    ".update": "newData.teamId = data.teamId"
                },
                status: {
                    ".create": "newData.status = 'pending'"
                }
            }
        }
    };
    var settings = {
        identity: identity,
        protectedData: protectedData,
        seedData: seedData,
        rules: rules$1
    };

    const plugins = [
        storage(settings),
        auth(settings),
        util$2(),
        rules(settings)
    ];

    const server = http__default['default'].createServer(requestHandler(plugins, services));

    const port = 3030;
    server.listen(port);
    console.log(`Server started on port ${port}. You can make requests to http://localhost:${port}/`);
    console.log(`Admin panel located at http://localhost:${port}/admin`);

    var softuniPracticeServerMaster = {

    };

    return softuniPracticeServerMaster;

})));
