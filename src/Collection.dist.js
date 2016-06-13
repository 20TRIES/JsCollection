/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * A class for handling collections of items.
	 *
	 * @since 4.0
	 */

	var Collection = function () {
	    /**
	     * Constructor
	     *
	     * @param {String} primary_key
	     */

	    function Collection(primary_key) {
	        var items = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

	        _classCallCheck(this, Collection);

	        /**
	         * @type {String}
	         */
	        this.primary_key = typeof primary_key == 'undefined' ? null : primary_key;

	        /**
	         * @type {Array}
	         */
	        this.items = typeof items == 'undefined' ? [] : items;

	        /**
	         * @type {Object}
	         */
	        this.operators = {
	            "!=": function _(val_1, val_2) {
	                return val_1 != val_2;
	            },
	            "=": function _(val_1, val_2) {
	                return val_1 == val_2;
	            }
	        };
	    }

	    /**
	     * Pushes an item into a collection.
	     *
	     * @param {*} item
	     */


	    _createClass(Collection, [{
	        key: 'push',
	        value: function push(item) {
	            this.items.push(item);
	        }

	        /**
	         * Determines whether a collection is empty.
	         *
	         * @returns {boolean}
	         */

	    }, {
	        key: 'isEmpty',
	        value: function isEmpty() {
	            return this.items.length == 0;
	        }

	        /**
	         * Removes all items from a collection.
	         *
	         * @returns {Collection}
	         */

	    }, {
	        key: 'truncate',
	        value: function truncate() {
	            this.items = [];
	            return this;
	        }

	        /**
	         * Pulls an items from a collection.
	         *
	         * @param {String|Number|Function} filter
	         * @returns {*|null}
	         */

	    }, {
	        key: 'pull',
	        value: function pull(user_filter) {
	            if (typeof user_filter == 'function') {
	                var filter = function filter(item) {
	                    return !user_filter(item);
	                };
	            } else {
	                var filter = function (primary_key) {
	                    return function (item) {
	                        return item[primary_key] != user_filter;
	                    };
	                }(this.primary_key);
	            }

	            var filtered_items = this.filter(filter);

	            var pulled = typeof filter == 'function' ? this.diff(filtered_items) : this.diff(filtered_items).first();

	            this.items = filtered_items.items;

	            return pulled;
	        }

	        /**
	         * Determines the difference of two collections.
	         *
	         * @param {Collection} items
	         * @returns {Collection}
	         */

	    }, {
	        key: 'diff',
	        value: function diff(collection) {
	            return this.filter(function (primary_key, collection) {
	                return function (item) {
	                    return collection.get(item[primary_key]) == null;
	                };
	            }(this.primary_key, collection));
	        }

	        /**
	         * Gets an item from the collection.
	         *
	         * @param {String|Number} id
	         * @returns {*|null}
	         */

	    }, {
	        key: 'get',
	        value: function get(id) {
	            var primary_key = this.primary_key;
	            return this.filter(function (item) {
	                return item[primary_key] == id;
	            }).first();
	        }

	        /**
	         * Determines the number of items within a collection.
	         *
	         * @returns {Number}
	         */

	    }, {
	        key: 'count',
	        value: function count() {
	            return this.items.length;
	        }

	        /**
	         * Gets the first item from a collection.
	         *
	         * @returns {*|null}
	         */

	    }, {
	        key: 'first',
	        value: function first() {
	            for (var key in this.items) {
	                return this.items[key];
	            }
	            return null;
	        }

	        /**
	         * Filters a collection using a user provided filter function.
	         *
	         * @param function user_filter
	         * @returns {Collection}
	         */

	    }, {
	        key: 'filter',
	        value: function filter(user_filter) {
	            var results = new this.constructor(this.primary_key);
	            for (var key in this.items) {
	                if (user_filter(this.items[key])) {
	                    results.push(this.items[key]);
	                }
	            }
	            return results;
	        }

	        /**
	         * Gets all items from a collection.
	         *
	         * @returns {Array}
	         */

	    }, {
	        key: 'all',
	        value: function all() {
	            return this.items;
	        }

	        /**
	         * Determines whether an item with a given is in a collection.
	         *
	         * @param {String|Number} id
	         * @returns {boolean}
	         */

	    }, {
	        key: 'has',
	        value: function has(id) {
	            return this.get(id) != null;
	        }

	        /**
	         * Filters a collection to those that have a specific attribute with a specified value.
	         *
	         * @param {String} attribute
	         * @param {*} value
	         * @returns {Collection}
	         */

	    }, {
	        key: 'where',
	        value: function where(attribute, operator, value) {
	            if (typeof value == 'undefined') {
	                value = operator;
	                operator = '=';
	            }
	            operator = this.operators[operator];
	            return this.filter(function (attribute, operator, value) {
	                return function (item) {
	                    return operator(item[attribute], value);
	                };
	            }(attribute, operator, value));
	        }

	        /**
	         * Plucks an attribute from each item in a collection.
	         *
	         * @param attribute
	         * @param key
	         * @returns {Collection}
	         */

	    }, {
	        key: 'pluck',
	        value: function pluck(attribute, key) {
	            if (typeof key != 'string') {
	                key = attribute;
	            }
	            var results = new Collection(key, []);
	            for (var item_key in this.all()) {
	                var item = this.items[item_key];
	                var plucked = {};
	                plucked[attribute] = item[attribute];
	                if (key != attribute) {
	                    plucked[key] = item[key];
	                }
	                results.push(plucked);
	            }
	            return results;
	        }

	        /**
	         * Filters a collection, returning only the first items to have a specific
	         * value for a given key.
	         *
	         * @param {string} key
	         * @returns {Collection}
	         */

	    }, {
	        key: 'unique',
	        value: function unique(key) {
	            if (typeof key == 'undefined') {
	                key = this.primary_key;
	            }
	            if (key == null) {
	                return this.filter(function (values) {
	                    return function (item) {
	                        if (values.indexOf(item) == -1) {
	                            values.push(item);
	                            return true;
	                        }
	                        return false;
	                    };
	                }([]));
	            } else {
	                return this.filter(function (key, values) {
	                    return function (item) {
	                        if (values.indexOf(item[key]) == -1) {
	                            values.push(item[key]);
	                            return true;
	                        }
	                        return false;
	                    };
	                }(key, []));
	            }
	        }

	        /**
	         * Gets a set of the first n items from a collection.
	         *
	         * @param int n
	         * @returns {Collection}
	         */

	    }, {
	        key: 'take',
	        value: function take(n) {
	            return new this.constructor(this.primary_key, this.items.slice(0, n));
	        }

	        /**
	         * Merges an array|collection of items into a collection.
	         *
	         * @param items
	         * @returns {Collection}
	         */

	    }, {
	        key: 'merge',
	        value: function merge(items) {
	            if (items instanceof Array) {
	                this.items = this.items.concat(items);
	            } else {
	                this.items = this.items.concat(items.items);
	            }
	            return this;
	        }

	        /**
	         * Applies a transformation to each item in the current collection.
	         *
	         * @param {Function} callback
	         * @returns {Collection}
	         */

	    }, {
	        key: 'transform',
	        value: function transform(callback) {
	            var items = [];
	            for (var key in this.items) {
	                items[key] = callback(this.items[key]);
	            }
	            return new Collection(null, items);
	        }

	        /**
	         * Sorts a collection.
	         *
	         * @param {function} callback
	         * @returns {Collection}
	         */

	    }, {
	        key: 'sort',
	        value: function sort(callback) {
	            this.items = this.items.sort(callback);
	            return this;
	        }
	    }]);

	    return Collection;
	}();

	exports.default = Collection;

/***/ }
/******/ ]);