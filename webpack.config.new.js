/**
 * HOWTO:
 *
 * npm run <watch|build>:<main|board|blockly> <--mode=development>
 *
 * @type {module:path}
 */

const path = require('path');
const webpack = require('webpack');
const { generate } = require('build-number-generator');

const lib_dir = __dirname + '/vendor/js';

const TerserPlugin          = require('terser-webpack-plugin');
const HtmlWebpackPlugin     = require('html-webpack-plugin');
const BuildNotifierPlugin   = require('webpack-build-notifier');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = (env, argv) => {
    const is_dev = env.mode === "development";

    return {
        entry: getEntries(env),
        devtool: is_dev ? 'eval-source-map' : 'source-map',
        optimization: {
            minimizer: [new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: false,
            })]
        },
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
            extensions: ['.tsx', '.ts', '.js'],
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
                title: "Tapanda [New]",
                logo: path.resolve("./img/favicon.png"),
            }),
        ]
    }
};

function getEntries(env) {
    // Bundle entries
    let entries = {};
    if (env.main === true)      entries['main'] = './app/js/MainApplication.ts';
    if (env.board === true)     entries['board'] = './app/js/BoardApplication.ts';

    return entries;
}

function getVersionNumber() {
    return generate(process.env.npm_package_version);
}

function getVersionMode(mode) {
    return mode === "development" ? "dev" : "";
}

function getVersionTarget(env, mode=null) {
    let matches = [env.main, env.board, env.blockly, env.timeline]
        .reduce((total, v_curr) => total += (v_curr === true), 0);

    if (matches > 1) return `mixed`;

    if (env.main === true)  return `main`;
    if (env.board === true) return `board`;
}