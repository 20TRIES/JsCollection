/**
 * A class for handling collections of items.
 *
 * @since 4.0
 */
export default class Collection {
    /**
     * Constructor
     *
     * @param {String} primary_key
     */
    constructor(primary_key, items = []) {
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
    }

    /**
     * Pushes an item into a collection.
     *
     * @param {*} item
     */
    push(item) {
        this.items.push(item);
    }

    /**
     * Determines whether a collection is empty.
     *
     * @returns {boolean}
     */
    isEmpty() {
        return this.items.length == 0;
    }

    /**
     * Removes all items from a collection.
     *
     * @returns {Collection}
     */
    truncate() {
        this.items = [];
        return this;
    }

    /**
     * Pulls an items from a collection.
     *
     * @param {String|Number|Function} filter
     * @returns {*|null}
     */
    pull(user_filter)
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
    }

    /**
     * Determines the difference of two collections.
     *
     * @param {Collection} items
     * @returns {Collection}
     */
    diff(collection)
    {
        return this.filter((function(primary_key, collection){
            return function(item)
            {
                return collection.get(item[primary_key]) == null;
            }
        })(this.primary_key, collection));
    }

    /**
     * Gets an item from the collection.
     *
     * @param {String|Number} id
     * @returns {*|null}
     */
    get(id) {
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
    count()
    {
        return this.items.length;
    }

    /**
     * Gets the first item from a collection.
     *
     * @returns {*|null}
     */
    first() {
        for(var key in this.items) {
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
    filter(user_filter) {
        var results = new this.constructor(this.primary_key);
        for(var key in this.items) {
            if(user_filter(this.items[key])) {
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
    all()
    {
        return this.items;
    }

    /**
     * Determines whether an item with a given is in a collection.
     *
     * @param {String|Number} id
     * @returns {boolean}
     */
    has(id) {
        return this.get(id) != null;
    }

    /**
     * Filters a collection to those that have a specific attribute with a specified value.
     *
     * @param {String} attribute
     * @param {*} value
     * @returns {Collection}
     */
    where(attribute, operator, value) {
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
    }

    /**
     * Plucks an attribute from each item in a collection.
     *
     * @param attribute
     * @param key
     * @returns {Collection}
     */
    pluck(attribute, key) {
        if(typeof key != 'string') {
            key = attribute;
        }
        var results = new Collection(key, []);
        for(var item_key in this.all()) {
            var item = this.items[item_key];
            var plucked = {};
            plucked[attribute] = item[attribute];
            if(key != attribute) {
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
    unique(key) {
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
    }

    /**
     * Gets a set of the first n items from a collection.
     *
     * @param int n
     * @returns {Collection}
     */
    take(n) {
        return new this.constructor(this.primary_key, this.items.slice(0,n));
    }

    /**
     * Merges an array|collection of items into a collection.
     *
     * @param items
     * @returns {Collection}
     */
    merge(items) {
        if(items instanceof Array) {
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
    transform(callback) {
        var items = [];
        for(var key in this.items) {
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
    sort(callback) {
        this.items = this.items.sort(callback);
        return this;
    }
}