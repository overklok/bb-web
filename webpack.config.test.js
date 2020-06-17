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
const BuildNotifierPlugin   = require('webpack-build-notifier');

module.exports = {
    entry: {
        // 'test': './app/js/core/__tests__/TestApplication.ts',
        'main': './app/js/MainApplication.ts',
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
            {
                loaders: ['style-loader', 'css-loader', 'less-loader'],
                test: /\.less/,
                include: [
                    path.resolve(__dirname, "node_modules/intro.js/"),
                    path.resolve(__dirname, "app"),
                ]
            },
            {
                loaders: ['style-loader', 'css-loader', 'less-loader'],
                test: /\.css/,
                include: [
                    path.resolve(__dirname, "node_modules/intro.js/"),
                    path.resolve(__dirname, "app"),
                ]
            },
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
        modules: [path.resolve(__dirname, './app'), 'node_modules']
    },
    plugins: [
         // new HtmlWebpackPlugin({
         //     template: './app/html/test.html',
         //     inject: 'body',
         //     filename: 'test.html'
         // }),
        new HtmlWebpackPlugin({
             template: './app/html/main.html',
             inject: 'body',
             filename: 'main.html'
         }),
        new BuildNotifierPlugin({
            title: "Tapanda Test",
            logo: path.resolve("./img/favicon.png"),
        }),
    ]
};