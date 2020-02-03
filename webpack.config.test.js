/**
 * HOWTO:
 *
 * npm run <watch|build>:<main|board|blockly> <--mode=development>
 *
 * @type {module:path}
 */

const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv').config();
const { generate } = require('build-number-generator');

const Dotenv                = require('dotenv-webpack');
const HtmlWebpackPlugin     = require('html-webpack-plugin');
const CopyWebpackPlugin     = require('copy-webpack-plugin');
// const BundleAnalyzerPlugin  = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const lib_dir = __dirname + '/vendor/js';

module.exports = {
    devtool: 'eval-source-map',
    module: {
        rules: [
            {
                loader: 'babel-loader',
                test: /\.js$/,
                exclude: /node_modules/
            },
            {
                use: 'ts-loader',
                test: /\.ts?$/,
                exclude: /node_modules/
            },
            {
                loaders: ['style-loader', 'css-loader'],
                test: /\.css/,
                include: [
                    path.resolve(__dirname, "node_modules/intro.js/"),
                    path.resolve(__dirname, "app"),
                ]
            },
            {
                test: require.resolve('jquery'),
                use: [
                    {
                        loader: 'expose-loader',
                        options: '$'
                    },
                ]
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
};