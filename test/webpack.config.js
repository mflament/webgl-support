const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: "development",
    entry: './src/index.ts',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Webgl support sandbox'
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    devtool: 'inline-source-map',
    devServer: {
        compress: true,
        host: "localhost",
        open: true,
        port: 3001
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    },
    watchOptions: {
        ignored: '**/node_modules',
    }
};