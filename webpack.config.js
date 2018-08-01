const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const lib_dir = __dirname + '/vendor/js';

module.exports = {
    entry: {
        bundle:             './app/js/index.js',
        // lesson_pane:        './app/js/lesson_pane.js',
        // admin_board:        './app/js/admin_board.js',
        // admin_blockly:      './app/js/admin_blockly.js',
    },
    devtool: 'eval-source-map', // 'source-map' for production
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    // resolve: {
    // alias: {
    // 'jquery-ui':  "jquery-ui/jquery-ui.js",
    // modules: path.join(__dirname, "node_modules"),
    // }
    // },
    module: {
        loaders: [
            // {
            //     loader: 'jshint-loader',
            //     test: /\.js$/,  // запустить загрузчик во всех файлах .js
            //     exclude: /node_modules/ // игнорировать все файлы в папке node_modules
            // },
            {
                loader: 'babel-loader',
                test: /\.js$/,
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
    externals: [
        (function () {
            var IGNORES = [
                'electron'
            ];
            return function (context, request, callback) {
                if (IGNORES.indexOf(request) >= 0) {
                    return callback(null, "(typeof require === \"function\") ? require('" + request + "') : undefined");
                }
                return callback();
            };
        })()
    ],
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        // new HtmlWebpackPlugin({
        //     template: './app/html/index.html',
        //     inject: 'body'
        // }),
        new HtmlWebpackPlugin({
             template: './app/html/board.html',
             inject: 'body',
             filename: 'board.html'
        }),
        // new HtmlWebpackPlugin({
        //     template: './app/html/admin.html',
        //     inject: 'body',
        //     filename: 'admin.html'
        // }),
        // new HtmlWebpackPlugin({
        //     template: './app/html/lesson-pane.html',
        //     inject: 'head',
        //     filename: 'lesson-pane.html'
        // }),
        new CopyWebpackPlugin([
            {from: './app/fonts/', to: './fonts'},
            // {from: './app/fonts/IBMPlexSans', to: '../../codehour-breadboard-client/web/fonts'},
            {from: './app/fonts/', to: '../../codehour-breadboard-server/frontend/static/frontend/app/fonts'},
            {from: './app/css/spinner.css', to: './spinner.css'},
            // {from: './app/css/spinner.css', to: '../../codehour-breadboard-client/web/spinner.css'},
            {from: './app/css/spinner.css', to: '../../codehour-breadboard-server/frontend/static/frontend/app/css/spinner.css'},
            {from: './app/images/', to: '../../codehour-breadboard-server/frontend/static/frontend/app/images'},

            // {from: './dist/index.html', to: '../../codehour-breadboard-client/web/index.html'},
            // {from: './dist/bundle.js', to: '../../codehour-breadboard-client/web/bundle.js'},
            {from: './dist/bundle.js', to: '../../codehour-breadboard-server/frontend/static/frontend/app/js/bundle.js'},
            // {from: './dist/admin_blockly.js', to: '../../codehour-breadboard-server/coursesvc/static/admin/vendor/admin-blockly/js/admin_blockly.js'},
            // {from: './dist/admin_board.js', to: '../../codehour-breadboard-server/coursesvc/static/admin/vendor/admin-board/js/admin_board.js'}
        ]),
        new webpack.WatchIgnorePlugin([
            /\.d\.ts$/
        ])
    ]
};
