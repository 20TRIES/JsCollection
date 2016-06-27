var assert = require('chai').assert;

import Collection from "../src/Collection";
import MissingParameterException from "../src/MissingParameterException";
import InvalidOperatorException from "../src/InvalidOperatorException";
import OutOfRangeException from "../src/OutOfRangeException";

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

    // First Method
    test('test_first_method_gets_first_item_pushed', function () {
        let collection = new Collection([]);

        collection.push({"id": 1});
        collection.push({"id": 2});
        collection.push({"id": 3});

        let result = collection.first();

        assert.equal(JSON.stringify(result), JSON.stringify({"id": 1}));
    });

    // Slice Method
    test('test_slice_method', function () {
        let collection = new Collection([]);

        collection.push({"id": 1});
        collection.push({"id": 2});
        collection.push({"id": 3});
        collection.push({"id": 4});
        collection.push({"id": 5});
        collection.push({"id": 6});
        collection.push({"id": 7});
        collection.push({"id": 8});
        collection.push({"id": 9});
        collection.push({"id": 10});

        let expected = new Collection([{"id": 1}, {"id": 2}, {"id": 3}, {"id": 4}, {"id": 5}]);

        let result = collection.slice(0, 5);

        assert.equal(JSON.stringify(result), JSON.stringify(expected));
    });
    test('test_slice_method_handles_negative_offsets', function () {
        let collection = new Collection([]);

        collection.push({"id": 1});
        collection.push({"id": 2});
        collection.push({"id": 3});
        collection.push({"id": 4});
        collection.push({"id": 5});
        collection.push({"id": 6});
        collection.push({"id": 7});
        collection.push({"id": 8});
        collection.push({"id": 9});
        collection.push({"id": 10});

        let expected = new Collection([{"id": 5}, {"id": 6}, {"id": 7}, {"id": 8}, {"id": 9}]);

        let result = collection.slice(-1, 5);

        assert.equal(JSON.stringify(result), JSON.stringify(expected));
    });
    test('test_slice_method_throws_exception_when_offset_exceeds_length_in_positive', function () {
        assert.throws(() => {
            let collection = new Collection([{"id": 1}, {"id": 2}, {"id": 3}]);
            collection.slice(4, 1);
        }, OutOfRangeException);
    });
    test('test_slice_method_throws_exception_when_offset_exceeds_length_in_negative', function () {
        assert.throws(() => {
            let collection = new Collection([{"id": 1}, {"id": 2}, {"id": 3}]);
            collection.slice(-4, 1);
        }, OutOfRangeException);
    });

    // Transform Method
    test('test_transform_method', function () {
        let collection = new Collection([{"id": 1}, {"id": 2}, {"id": 3}, {"id": 4}, {"id": 5}]);
        let expected = new Collection([{"id": 2}, {"id": 3}, {"id": 4}, {"id": 5}, {"id": 6}]);
        let result = collection.transform((item) => {
            ++item.id;
            return item;
        });
        assert.equal(JSON.stringify(result), JSON.stringify(expected));
    });
    test('test_transform_method_doesnt_change_original_collection', function () {
        let collection = new Collection([{"id": 1}, {"id": 2}, {"id": 3}, {"id": 4}, {"id": 5}]);
        let expected = JSON.stringify(collection);
        collection.transform((item) => {
            ++item.id;
            return item;
        });
        assert.equal(expected, JSON.stringify(collection));
    });

    // Pluck method
    test('test_pluck_method', function () {
        let collection = new Collection([
            {"id": 1, "name": "one"},
            {"id": 2, "name": "two"},
            {"id": 3, "name": "three"},
            {"id": 4, "name": "four"},
            {"id": 5, "name": "five"}
        ], "id");
        let result = collection.pluck("name");
        let expected = new Collection([
            {"name": "one"},
            {"name": "two"},
            {"name": "three"},
            {"name": "four"},
            {"name": "five"}
        ], "name");
        assert.equal(JSON.stringify(result), JSON.stringify(expected));
    });
    test('test_pluck_method_takes_key', function () {
        let collection = new Collection([
            {"id": 1, "name": "one"},
            {"id": 2, "name": "two"},
            {"id": 3, "name": "three"},
            {"id": 4, "name": "four"},
            {"id": 5, "name": "five"}
        ], "id");
        let result = collection.pluck("name", "id");
        let expected = new Collection([
            {"id": 1, "name": "one"},
            {"id": 2, "name": "two"},
            {"id": 3, "name": "three"},
            {"id": 4, "name": "four"},
            {"id": 5, "name": "five"}
        ], "id");
        assert.equal(JSON.stringify(result), JSON.stringify(expected));
    });
});