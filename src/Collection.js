import MissingParameterException from "./MissingParameterException";
import InvalidOperatorException from "./InvalidOperatorException";
import OutOfRangeException from "./OutOfRangeException";

var clone = require('clone');

/**
 * A class for handling collections of items.
 */
export default class Collection {
    /**
     * Constructor
     *
     * @param {Array} items
     * @param {String} primary_key
     */
    constructor(items = [], primary_key = null) {
        /**
         * @type {String}
         */
        this.primary_key = typeof primary_key == 'undefined' ? null : primary_key;

        /**
         * @type {Array}
         */
        this.items = items instanceof Array ? items : [];

        /**
         * @type {Object}
         */
        this.operators = {
            "!=": function (attribute, value) {
                return (item) => item[attribute] != value;
            },
            "=": function (attribute, value) {
                return (item) => item[attribute] == value;
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
        return this.count() == 0;
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
        return this.filter((item) => item[this.primary_key] == id).first();
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
        return this.items[0];
    }

    /**
     * Gets a slice of a collection using a given offset and size value.
     *
     * @param {int} offset
     * @param {int} size
     * @returns {Collection}
     */
    slice(offset, size) {
        if (size <= 0) {
            throw new OutOfRangeException('Take must be >0');
        } else if (Math.abs(offset) > this.count()) {
            throw new OutOfRangeException('Offset exceeds number of items within collection');
        }

        let slice = new this.constructor([], this.primary_key);
        offset = offset >= 0 ? offset : size + offset;

        for (let i = 0, item = this.items[0]; i < this.count() && size > 0; item=this.items[++i]) {
            if (offset > 0) {
                --offset;
            } else {
                --size;
                slice.push(item);
            }
        }
        return slice;
    }

    /**
     * Filters a collection using a user provided filter function.
     *
     * @param {Function} callback
     * @returns {Collection}
     */
    filter(callback) {
        let subset = new this.constructor([], this.primary_key);
        this.each((key, item, subset) => {
            if(callback(this.items[key])) {
                subset.push(this.items[key]);
            }
        }, subset);
        return subset;
    }

    /**
     * Executes a callback for each item within a collection.
     *
     * No change is made to the collection and no new collection is returned. To break from the
     * loop, return false.
     *
     * @param {Function} callback
     * @param {...*} $args
     */
    each(callback, ...$args) {
        let should_continue = true;
        for(let i=0; i < this.count() && should_continue; ++i) {
            let item = clone(this.items[i]);
            should_continue = callback(i, item, ...$args) !== false;
        }
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
     * @param {*} args ({?attribute_name}, {?operator}, {value|function})
     * @returns {Collection}
     */
    where(...args) {
        let callback, value;
        if(args.length < 1) {
            throw new MissingParameterException("At least one parameter must be passed.");
        } else if(args[0] instanceof Function) {
            callback = args[0];
            value = null;
        } else if(args.length > 2) {
            let attribute = args[0];
            let operator = args[1];
            if(typeof this.operators[operator] == 'undefined') {
                throw new InvalidOperatorException(`Invalid operator '${operator}'`);
            }
            value = args[2];
            callback = this.operators[operator](attribute, value);
        } else {
            let attribute = args[0];
            let operator = "=";
            value = args[1];
            callback = this.operators[operator](attribute, value);
        }
        return this.filter((item) => callback(item, value));
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