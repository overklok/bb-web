/**
 * HOWTO:
 *
 * npm run <watch|build>:<main|board|blockly> <--mode=development>
 *
 * @type {module:path}
 */

const path = require('path');
const webpack = require('webpack');

const lib_dir = __dirname + '/vendor/js';

const HtmlWebpackPlugin     = require('html-webpack-plugin');

module.exports = {
    entry: {
        'test': './app/js/core/__tests__/dummy/TestApplication.ts',
    },
    devtool: 'eval-source-map',
    mode: 'development',
    module: {
        rules: [
            {
                loader: 'babel-loader',
                test: /\.js$/,
                exclude: /node_modules/
            },
            {
                use: 'ts-loader',
                test: /\.tsx?$/,
                exclude: /node_modules/
            },

        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    plugins: [
         new HtmlWebpackPlugin({
             template: './app/html/test.html',
             inject: 'body',
             filename: 'test.html'
         }),
    ]
};