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

const lib_dir = __dirname + '/vendor/js';

const TerserPlugin          = require('terser-webpack-plugin');
const HtmlWebpackPlugin     = require('html-webpack-plugin');
const CopyWebpackPlugin     = require('copy-webpack-plugin');
const BuildNotifierPlugin   = require('webpack-build-notifier');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = (env, argv) => {
    const is_dev = env.mode === "development";
    const [ver, tgt, mode] = [getVersionNumber(), getVersionTarget(env), getVersionMode(argv.mode)]
    const VERSION = mode ? `${tgt}/${ver}-${mode} [new]` : `${tgt}/${ver} [new]`;

    console.info("Building", VERSION);

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
            new CopyWebpackPlugin(getCopypaths(env)),
            new HtmlWebpackPlugin({
                template: './app/html/main.html',
                inject: 'body',
                filename: 'main.html'
            }),
            new BuildNotifierPlugin({
                title: "Tapanda [New]",
                logo: path.resolve("./img/favicon.png"),
            }),
            new webpack.DefinePlugin({
                '__VERSION__': `'${VERSION}'`,
            }),
        ]
    }
};

function getCopypaths(env) {
    if (!dotenv.parsed) {
        console.warn("Nothing to copy.");
        return [];
    }

    // Copy paths
    let copypaths = [];

    if (env.monitor === true && dotenv.parsed.PATH_DIST_MONITOR) {
        copypaths = [...copypaths,
            {from: './dist/monitor.js',     to: dotenv.parsed.PATH_DIST_MONITOR + '/board.js'}
        ];
    }

    if (env.board === true && dotenv.parsed.PATH_DIST_MONITOR_SOCK) {
        copypaths = [...copypaths,
            {from: './dist/monitor.js',     to: dotenv.parsed.PATH_DIST_MONITOR_SOCK + '/board.js'}
        ];
    }

    return copypaths;
}

function getEntries(env) {
    // Bundle entries
    let entries = {};
    if (env.main === true)      entries['main']     = './app/js/MainApplication.ts';
    if (env.monitor === true)   entries['monitor']  = './app/js/MonitorApplication.ts';
    if (env.monkey === true)    entries['monkey']   = './app/js/MonkeytestApplication.ts';

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

    if (env.main === true)      return `main`;
    if (env.monitor === true)   return `monitor`;
    if (env.monkey === true)    return `monkey`;
}