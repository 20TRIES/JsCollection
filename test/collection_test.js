/**
 * A base exception class that all exceptions within the collection package will extend.
 */
var CollectionException = function CollectionException(message) {

    /**
     * @type {String}
     */
    this.message = message;
};

/**
 * Gets a string representation of an object.
 *
 * @return {String}
 */
CollectionException.prototype.toString = function toString() {
    return this.message;
};

/**
 * An exception class that can be thrown when a required parameter is missing.
 */
var MissingParameterException = (function (CollectionException) {
	function MissingParameterException () {
		CollectionException.apply(this, arguments);
	}if ( CollectionException ) MissingParameterException.__proto__ = CollectionException;
	MissingParameterException.prototype = Object.create( CollectionException && CollectionException.prototype );
	MissingParameterException.prototype.constructor = MissingParameterException;

	

	return MissingParameterException;
}(CollectionException));

/**
 * An exception class that can be thrown when an invalid operator has been requested.
 */
var InvalidOperatorException = (function (CollectionException) {
	function InvalidOperatorException () {
		CollectionException.apply(this, arguments);
	}if ( CollectionException ) InvalidOperatorException.__proto__ = CollectionException;
	InvalidOperatorException.prototype = Object.create( CollectionException && CollectionException.prototype );
	InvalidOperatorException.prototype.constructor = InvalidOperatorException;

	

	return InvalidOperatorException;
}(CollectionException));

/**
 * A class for handling collections of items.
 */
var Collection = function Collection(items, primary_key) {
    if ( items === void 0 ) items = [];
    if ( primary_key === void 0 ) primary_key = null;

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
            return function (item) { return item[attribute] != value; };
        },
        "=": function (attribute, value) {
            return function (item) { return item[attribute] == value; };
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
 * @param {*} args ({?attribute_name}, {?operator}, {value|function})
 * @returns {Collection}
 */
Collection.prototype.where = function where() {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

    var callback, value;
    if(args.length < 1) {
        throw new MissingParameterException("At least one parameter must be passed.");
    } else if(args[0] instanceof Function) {
        callback = args[0];
        value = null;
    } else if(args.length > 2) {
        var attribute = args[0];
        var operator = args[1];
        if(typeof this.operators[operator] == 'undefined') {
            throw new InvalidOperatorException(("Invalid operator '" + operator + "'"));
        }
        value = args[2];
        callback = this.operators[operator](attribute, value);
    } else {
        var attribute$1 = args[0];
        var operator$1 = "=";
        value = args[1];
        callback = this.operators[operator$1](attribute$1, value);
    }
    return this.filter(function (item) { return callback(item, value); });
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

var assert = require('chai').assert;

suite('Collection', function() {
    test('test_where_method_takes_function', function () {
        var collection = new Collection([{"id": 1}, {"id": 2}, {"id": 3}]);
        var expected_collection = new Collection([{"id": 1}]);
        var result = collection.where(function (item) { return item.id == 1; });
        assert.equal(JSON.stringify(expected_collection), JSON.stringify(result));
    });
    test('test_where_method_takes_attribute_and_value', function () {
        var collection = new Collection([{"id": 1}, {"id": 2}, {"id": 3}]);
        var expected_collection = new Collection([{"id": 1}]);
        var result = collection.where("id", 1);
        assert.equal(JSON.stringify(expected_collection), JSON.stringify(result));
    });
    test('test_where_method_takes_attribute_value_and_operator', function () {
        var collection = new Collection([{"id": 1}, {"id": 2}, {"id": 3}]);
        var expected_collection = new Collection([{"id": 1}]);
        var result = collection.where("id", "=", 1);
        assert.equal(JSON.stringify(expected_collection), JSON.stringify(result));
    });
    test('test_where_method_requires_at_least_one_parameter', function () {
        assert.throws(function () {
            var collection = new Collection([{"id": 1}, {"id": 2}, {"id": 3}]);
            collection.where();
        }, MissingParameterException);
    });
    test('test_where_method_requires_a_valid_operator', function () {
        assert.throws(function () {
            var collection = new Collection([{"id": 1}, {"id": 2}, {"id": 3}]);
            collection.where("id", "invalid_operator", 1);
        }, InvalidOperatorException);
    });
});