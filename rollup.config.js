import buble from 'rollup-plugin-buble';

export default {
    entry: 'src/Collection.js',
    dest: 'src/Collection.dist.js',
    plugins: [
        buble()
    ],
    moduleName: "Collection",
    format: 'iife'
};