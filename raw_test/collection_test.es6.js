var assert = require('chai').assert;

import Collection from "../src/Collection";
import MissingParameterException from "../src/MissingParameterException";
import InvalidOperatorException from "../src/InvalidOperatorException";

suite('Collection', function() {

    // Each Method
    test('test_each_method_passes_extra_arguments_to_closure', function () {
        let collection = new Collection([{"id": 1}]);
        let arg = "mock_string";
        collection.each((key, item, extra_arg) => {
            assert.equal(extra_arg, "mock_string");
        }, arg);
    });
    test('test_each_method_iterates_each_item', function () {
        let items = [{"id": 1}, {"id": 2}, {"id": 3}];
        let collection = new Collection(items);
        let iterated = [];
        collection.each((key, item, iterated) => {
            iterated.push(item);
        }, iterated);
        assert.equal(JSON.stringify(iterated), JSON.stringify(items));
    });
    test('test_each_doesnt_change_the_original_collection', function () {
        let collection = new Collection([{"id": 1}]);
        let expected = JSON.stringify(collection);
        collection.each((key, item) => {
           item.id = 99;
        });
        assert.equal(JSON.stringify(collection), expected);
    });
    test('test_each_breaks_if_result_is_false', function () {
        let collection = new Collection([{"id": 1}, {"id": 1}]);
        let iterated = [];
        collection.each((key, item) => {
            iterated.push(item);
            return false;
        });
        let expected = [{"id": 1}];
        assert.equal(JSON.stringify(iterated), JSON.stringify(expected));
    });

    // Filter Method
    test('test_filter_method', function () {
        let collection = new Collection([{"id": 1}, {"id": 2}, {"id": 3}]);
        let expected_1 = JSON.stringify(collection);
        let expected_2 = new Collection([{"id": 1}]);
        let result = collection.filter(function($item) {
            return $item.id == 1;
        });
        // Assert that the original collection is unchanged
        assert.equal(expected_1, JSON.stringify(collection));
        // Assert that the results is as expected.
        assert.equal(JSON.stringify(expected_2), JSON.stringify(result));
    });

    // Where Method
    test('test_where_method_takes_function', function () {
        let collection = new Collection([{"id": 1}, {"id": 2}, {"id": 3}]);
        let expected_collection = new Collection([{"id": 1}]);
        let result = collection.where((item) => item.id == 1);
        assert.equal(JSON.stringify(expected_collection), JSON.stringify(result));
    });
    test('test_where_method_takes_attribute_and_value', function () {
        let collection = new Collection([{"id": 1}, {"id": 2}, {"id": 3}]);
        let expected_collection = new Collection([{"id": 1}]);
        let result = collection.where("id", 1);
        assert.equal(JSON.stringify(expected_collection), JSON.stringify(result));
    });
    test('test_where_method_takes_attribute_value_and_operator', function () {
        let collection = new Collection([{"id": 1}, {"id": 2}, {"id": 3}]);
        let expected_collection = new Collection([{"id": 1}]);
        let result = collection.where("id", "=", 1);
        assert.equal(JSON.stringify(expected_collection), JSON.stringify(result));
    });
    test('test_where_method_requires_at_least_one_parameter', function () {
        assert.throws(() => {
            let collection = new Collection([{"id": 1}, {"id": 2}, {"id": 3}]);
            collection.where();
        }, MissingParameterException);
    });
    test('test_where_method_requires_a_valid_operator', function () {
        assert.throws(() => {
            let collection = new Collection([{"id": 1}, {"id": 2}, {"id": 3}]);
            collection.where("id", "invalid_operator", 1);
        }, InvalidOperatorException);
    });
});