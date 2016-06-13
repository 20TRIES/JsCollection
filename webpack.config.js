module.exports = {
    entry: "./src/Collection.js",
    output: {
        path: `./src`,
        filename: "Collection.dist.js"
    },
    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};