var Collection = (function () {
    'use strict';

    /**
     * A class for handling collections of items.
     *
     * @since 4.0
     */
    var Collection = function Collection(primary_key, items) {
        if ( items === void 0 ) items = [];

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
            "!=": function(val_1, val_2)
            {
                return val_1 != val_2;
            },
            "=": function(val_1, val_2)
            {
                return val_1 == val_2;
            }
        };
    };

    /**
     * Pushes an item into a collection.
     *
     * @param {*} item
     */
    Collection.prototype.push = function push(item) {
        this.items.push(item);
    };

    /**
     * Determines whether a collection is empty.
     *
     * @returns {boolean}
     */
    Collection.prototype.isEmpty = function isEmpty() {
        return this.items.length == 0;
    };

    /**
     * Removes all items from a collection.
     *
     * @returns {Collection}
     */
    Collection.prototype.truncate = function truncate() {
        this.items = [];
        return this;
    };

    /**
     * Pulls an items from a collection.
     *
     * @param {String|Number|Function} filter
     * @returns {*|null}
     */
    Collection.prototype.pull = function pull(user_filter)
    {
        if(typeof user_filter == 'function') {
            var filter = function(item) {
                return !user_filter(item);
            }
        } else {
            var filter = (function(primary_key) {
                return function (item) {
                    return item[primary_key] != user_filter;
                }
            })(this.primary_key);
        }

        var filtered_items = this.filter(filter);

        var pulled = typeof filter == 'function' ? this.diff(filtered_items) : this.diff(filtered_items).first();

        this.items = filtered_items.items;

        return pulled;
    };

    /**
     * Determines the difference of two collections.
     *
     * @param {Collection} items
     * @returns {Collection}
     */
    Collection.prototype.diff = function diff(collection)
    {
        return this.filter((function(primary_key, collection){
            return function(item)
            {
                return collection.get(item[primary_key]) == null;
            }
        })(this.primary_key, collection));
    };

    /**
     * Gets an item from the collection.
     *
     * @param {String|Number} id
     * @returns {*|null}
     */
    Collection.prototype.get = function get(id) {
        var primary_key = this.primary_key;
        return this.filter(function (item) {
            return item[primary_key] == id;
        }).first();
    };

    /**
     * Determines the number of items within a collection.
     *
     * @returns {Number}
     */
    Collection.prototype.count = function count()
    {
        return this.items.length;
    };

    /**
     * Gets the first item from a collection.
     *
     * @returns {*|null}
     */
    Collection.prototype.first = function first() {
            var this$1 = this;

        for(var key in this.items) {
            return this$1.items[key];
        }
        return null;
    };

    /**
     * Filters a collection using a user provided filter function.
     *
     * @param function user_filter
     * @returns {Collection}
     */
    Collection.prototype.filter = function filter(user_filter) {
            var this$1 = this;

        var results = new this.constructor(this.primary_key);
        for(var key in this.items) {
            if(user_filter(this$1.items[key])) {
                results.push(this$1.items[key]);
            }
        }
        return results;
    };

    /**
     * Gets all items from a collection.
     *
     * @returns {Array}
     */
    Collection.prototype.all = function all()
    {
        return this.items;
    };

    /**
     * Determines whether an item with a given is in a collection.
     *
     * @param {String|Number} id
     * @returns {boolean}
     */
    Collection.prototype.has = function has(id) {
        return this.get(id) != null;
    };

    /**
     * Filters a collection to those that have a specific attribute with a specified value.
     *
     * @param {String} attribute
     * @param {*} value
     * @returns {Collection}
     */
    Collection.prototype.where = function where(attribute, operator, value) {
        if(typeof value == 'undefined') {
            value = operator;
            operator = '='
        }
        operator = this.operators[operator];
        return this.filter((function(attribute, operator, value){
            return function(item) {
                return operator(item[attribute], value);
            }
        })(attribute, operator, value));
    };

    /**
     * Plucks an attribute from each item in a collection.
     *
     * @param attribute
     * @param key
     * @returns {Collection}
     */
    Collection.prototype.pluck = function pluck(attribute, key) {
            var this$1 = this;

        if(typeof key != 'string') {
            key = attribute;
        }
        var results = new Collection(key, []);
        for(var item_key in this.all()) {
            var item = this$1.items[item_key];
            var plucked = {};
            plucked[attribute] = item[attribute];
            if(key != attribute) {
                plucked[key] = item[key];
            }
            results.push(plucked);
        }
        return results;
    };


    /**
     * Filters a collection, returning only the first items to have a specific
     * value for a given key.
     *
     * @param {string} key
     * @returns {Collection}
     */
    Collection.prototype.unique = function unique(key) {
        if(typeof key == 'undefined') {
            key = this.primary_key;
        }
        if(key == null) {
            return this.filter(function(values) {
                return function(item) {
                    if(values.indexOf(item) == -1) {
                        values.push(item);
                        return true;
                    }
                    return false;
                }
            }([]));
        } else {
            return this.filter(function(key, values) {
                return function(item) {
                    if(values.indexOf(item[key]) == -1) {
                        values.push(item[key]);
                        return true;
                    }
                    return false;
                }
            }(key, []));
        }
    };

    /**
     * Gets a set of the first n items from a collection.
     *
     * @param int n
     * @returns {Collection}
     */
    Collection.prototype.take = function take(n) {
        return new this.constructor(this.primary_key, this.items.slice(0,n));
    };

    /**
     * Merges an array|collection of items into a collection.
     *
     * @param items
     * @returns {Collection}
     */
    Collection.prototype.merge = function merge(items) {
        if(items instanceof Array) {
            this.items = this.items.concat(items);
        } else {
            this.items = this.items.concat(items.items);
        }
        return this;
    };

    /**
     * Applies a transformation to each item in the current collection.
     *
     * @param {Function} callback
     * @returns {Collection}
     */
    Collection.prototype.transform = function transform(callback) {
            var this$1 = this;

        var items = [];
        for(var key in this.items) {
            items[key] = callback(this$1.items[key]);
        }
        return new Collection(null, items);
    };

    /**
     * Sorts a collection.
     *
     * @param {function} callback
     * @returns {Collection}
     */
    Collection.prototype.sort = function sort(callback) {
        this.items = this.items.sort(callback);
        return this;
    };

    return Collection;

}());