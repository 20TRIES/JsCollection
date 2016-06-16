var assert = require('chai').assert;

import Collection from "../src/Collection";
import MissingParameterException from "../src/MissingParameterException";
import InvalidOperatorException from "../src/InvalidOperatorException";

suite('Collection', function() {
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