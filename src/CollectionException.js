/**
 * A base exception class that all exceptions within the collection package will extend.
 */
export default class CollectionException {
    /**
     * Constructor
     *
     * @param {String} message
     */
    constructor(message) {

        /**
         * @type {String}
         */
        this.message = message;
    }

    /**
     * Gets a string representation of an object.
     *
     * @return {String}
     */
    toString() {
        return this.message;
    }
}
