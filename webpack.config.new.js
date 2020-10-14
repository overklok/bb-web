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
const BundleAnalyzerPlugin  = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


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
            ...getHtmlCopyPluginInstances(env),
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

    if (env.board === true && dotenv.parsed.PATH_DIST_BOARD) {
        copypaths = [...copypaths,
            {from: './dist/board.js',     to: dotenv.parsed.PATH_DIST_BOARD + '/board.js'}
        ];
    }

    if (env.board === true && dotenv.parsed.PATH_DIST_BOARD_SOCK) {
        copypaths = [...copypaths,
            {from: './dist/board.js',     to: dotenv.parsed.PATH_DIST_BOARD_SOCK + '/board.js'}
        ];
    }

    if (env.board === true && dotenv.parsed.PATH_DIST_BOARD_ADMIN) {
        copypaths = [...copypaths,
            {from: './dist/board.js',     to: dotenv.parsed.PATH_DIST_BOARD_ADMIN + '/board.js'}
        ];
    }

    if (env.monkey === true && dotenv.parsed.PATH_DIST_MONKEY) {
        copypaths = [...copypaths,
            {from: './dist/monkey.js',     to: dotenv.parsed.PATH_DIST_MONKEY + '/monkey.js'}
        ];
    }

    if (env.playground === true && dotenv.parsed.PATH_DIST_PLAYGROUND) {
        copypaths = [...copypaths,
            {from: './dist/playground.js',     to: dotenv.parsed.PATH_DIST_PLAYGROUND + '/playground.js'}
        ];
    }

    return copypaths;
}

function getEntries(env) {
    // Bundle entries
    let entries = {};
    if (env.main === true)          entries['main']         = './app/js/MainApplication.ts';
    if (env.board === true)         entries['board']        = './app/js/BoardApplication.ts';
    if (env.monkey === true)        entries['monkey']       = './app/js/MonkeyApplication.ts';
    if (env.playground === true)    entries['playground']   = './app/js/PlaygroundApplication.ts';

    return entries;
}

function getVersionNumber() {
    return generate(process.env.npm_package_version);
}

function getVersionMode(mode) {
    return mode === "development" ? "dev" : "";
}

function getVersionTarget(env, mode=null) {
    let matches = [env.main, env.board, env.monkey, env.playground]
        .reduce((total, v_curr) => total += (v_curr === true), 0);

    if (matches > 1) return `mixed`;

    if (env.main === true)          return `main`;
    if (env.board === true)         return `board`;
    if (env.monkey === true)        return `monkey`;
    if (env.playground === true)    return `playground`;
}

function getHtmlCopyPluginInstances(env) {
    // HTML Webpack files
    let htmls = [];
    if (env.main === true) {
        htmls = [...htmls,
            new HtmlWebpackPlugin({
                template: './app/html/main.html',
                inject: 'body',
                filename: 'main.html'
            }),
        ];
    }
    if (env.board === true) {
        htmls = [...htmls,
            new HtmlWebpackPlugin({
                template: './app/html/board.html',
                inject: 'body',
                filename: 'board.html'
            }),
        ];
    }
    if (env.monkey === true) {
        htmls = [...htmls,
            new HtmlWebpackPlugin({
                template: './app/html/monkey.html',
                inject: 'body',
                filename: 'monkey.html'
            }),
        ];
    }
    if (env.playground === true) {
        htmls = [...htmls,
            new HtmlWebpackPlugin({
                template: './app/html/playground.html',
                inject: 'body',
                filename: 'playground.html'
            }),
        ];
    }

    return htmls;
}