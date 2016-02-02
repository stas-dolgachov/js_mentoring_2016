(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = dispatcherFactory;

function dispatcherFactory() {
    var dispatcher = undefined;

    dispatcher = _Dispatcher();

    function createAction(type) {
        if (!type) {
            throw new Error('Please, provide action\'s type.');
        } else {
            return function (payload) {
                return dispatcher.dispatch({ type: type, payload: payload });
            };
        }
    }

    function createSubscriber(store) {
        return dispatcher.register(store);
    }

    return {
        createAction: createAction,
        createSubscriber: createSubscriber
    };
}

function _Dispatcher() {
    return {
        _stores: [],

        register: function register(store) {
            if (!store || !store.update) {
                throw new Error('You should provide a store that has an `update` method.');
            } else {
                var consumers = [];
                var change = function change() {
                    consumers.forEach(function (l) {
                        l(store);
                    });
                };
                var subscribe = function subscribe(consumer, noInit) {
                    consumers.push(consumer);
                    !noInit ? consumer(store) : null;
                };

                this._stores.push({ store: store, change: change });
                return subscribe;
            }
        },

        dispatch: function dispatch(action) {
            if (this._stores.length > 0) {
                this._stores.forEach(function (entry) {
                    entry.store.update(action, entry.change);
                });
            }
        }
    };
}

},{}],2:[function(require,module,exports){
'use strict';

var moduleFactory = require('./module.factory.js');
var createDispatcher = require('./dispatcher.factory.js');
var createStore = require('./store.factory.js');
var createView = require('./view.factory.js');
var router = require('./router.js');

function factory() {

    return {
        module: moduleFactory,
        dispatcher: createDispatcher,
        store: createStore,
        view: createView,
        router: router
    };
}

module.exports = factory;

},{"./dispatcher.factory.js":1,"./module.factory.js":3,"./router.js":4,"./store.factory.js":5,"./view.factory.js":6}],3:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ModuleFactory = function () {
    function ModuleFactory(name) {
        _classCallCheck(this, ModuleFactory);

        if (!name || typeof name !== 'string') {
            throw new Error('Cannot create module without a name');
        } else {
            this.name = name;
            this._dispatcher = null;
        }
    }

    _createClass(ModuleFactory, [{
        key: 'setDispatcher',
        value: function setDispatcher(dispatcher) {
            if ((typeof dispatcher === 'undefined' ? 'undefined' : _typeof(dispatcher)) === 'object' && dispatcher.hasOwnProperty) {
                return this._dispatcher = dispatcher;
            } else {
                throw new Error('Cannot set dispatcher');
            }
        }
    }]);

    return ModuleFactory;
}();

module.exports = ModuleFactory;

},{}],4:[function(require,module,exports){
'use strict';

var xhr = require('../utils/xhr.js');

var router;
var el;

module.exports = getRouter;

function getRouter() {
    if (!router) {
        router = CreateRouter();
    }

    return router;
}

function CreateRouter() {
    el = document.querySelector('[data-view]');

    if (!el) {
        throw new Error('cannot init router, because of absence of HTML hook');
    }

    return {
        routes: [],
        curRoute: '',
        add: add,
        check: check,
        switchTo: switchTo,
        listen: listen
    };

    function add(url, config) {
        if (typeof url === "string") {
            for (var i = 0; i < this.routes.length; i++) {
                if (this.routes[i].url === url) {
                    console.log("[Router]: Route ", url, "is already exist ");
                    return this;
                }
            }
            this.routes.push({ url: url, templateUrl: config.templateUrl, views: config.views });
        }

        return this;
    }

    function check(route) {
        for (var i = 0; i < this.routes.length; i++) {
            if (this.routes[i].url === route) {
                return i;
            }
        }
    }

    function switchTo(newRoute) {
        var routeId = this.check(newRoute);
        var route = this.routes[routeId];

        if (route === this.routes[this.curRoute]) {
            return;
        }

        if (route) {
            location.hash = route.url;

            xhr.get(route.templateUrl, function (response) {
                if (el) {
                    el.innerHTML = response;
                }

                route.views.forEach(function (view) {
                    view.init();
                });
            });

            this.curRoute = routeId;
            console.log("[router]: switched to", newRoute);

            return true;
        } else {
            console.log("[router]: such route doesn't exist: ", newRoute);
            location.hash = this.routes[this.curRoute].url;
            return false;
        }
    }

    function listen() {
        var self = this;

        function fn() {
            var match = window.location.href.match(/#(.*)$/);
            var newHash = match ? match[1] : '';
            newHash = newHash.toString().replace(/#/, '');

            console.log("[router]hash changed to", newHash);
            switchTo.call(self, newHash);
        }

        clearInterval(self.interval);
        self.interval = setInterval(fn, 50);
    }
}

},{"../utils/xhr.js":8}],5:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function storeFactory(factoryFunction) {
    var store;

    if (typeof factoryFunction !== 'function') {
        throw new Error('To create store you need to send factory function');
    }

    store = factoryFunction();

    if ((typeof store === 'undefined' ? 'undefined' : _typeof(store)) !== 'object') {
        throw new Error('Factory function should return object');
    }

    if (typeof store.update === 'function' && typeof store.get === 'function') {
        return store;
    } else {
        throw new Error('Store should have "get" and "update" methods');
    }
}

module.exports = storeFactory;

},{}],6:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function View(subscribeToStore, factoryFunction) {
    if (_validateStore(subscribeToStore) && typeof factoryFunction === 'function') {
        var view = factoryFunction(subscribeToStore);

        if (_validateView(view)) {
            return view;
        }
    }

    throw new Error('cannot create view');
}

function _validateStore(subscribeToStore) {
    var subscribeToStore = typeof subscribeToStore === 'undefined' ? 'undefined' : _typeof(subscribeToStore);

    return subscribeToStore === 'function';
}

function _validateView(view) {
    var viewType = typeof view === 'undefined' ? 'undefined' : _typeof(view);

    return viewType === 'object' && view.hasOwnProperty && view.hasOwnProperty('render');
}

module.exports = View;

},{}],7:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/*
Trifon framework
*/

var factory = require('./modules/main.factory.js');

(function () {
    var root = (typeof self === 'undefined' ? 'undefined' : _typeof(self)) === 'object' && self.self === self && self;

    root.seal = factory();
})(factory);

},{"./modules/main.factory.js":2}],8:[function(require,module,exports){
'use strict';

module.exports = function () {
    return {
        get: get
    };

    function get(url, callback) {
        var xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.send();

        xhr.onreadystatechange = function () {
            // (3)
            if (xhr.readyState != 4) return;

            if (xhr.status != 200) {
                alert(xhr.status + ': ' + xhr.statusText);
            } else {
                callback(xhr.responseText);
            }
        };
    }
}();

},{}]},{},[7])


//# sourceMappingURL=trifon.js.map
