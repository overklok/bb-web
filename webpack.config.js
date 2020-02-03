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

module.exports = (env, argv) => {
    const [ver, tgt, mode] = [getVersionNumber(), getVersionTarget(env), getVersionMode(argv.mode)]
    const VERSION = mode ? `${tgt}/${ver}-${mode}` : `${tgt}/${ver}`;
    
    console.info("Building", VERSION);

    return {
        entry: getEntries(env),
        devtool: 'eval-source-map', // 'source-map' for production
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist')
        },
        module: {
            rules: [
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
        externals: [
            (function () {
                let IGNORES = [
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
            new Dotenv(),
            ...getHtmlCopyPluginInstances(env),
            new CopyWebpackPlugin(getCopypaths(env)),
            new webpack.DefinePlugin({
                // 'process.env.NODE_ENV': '"production"',
                '__VERSION__': `'${VERSION}'`,
            }),
            new webpack.ProvidePlugin({
                $: 'jquery',
                // jQuery: 'jquery'
            }),
            new webpack.WatchIgnorePlugin([
                /\.d\.ts$/
            ]),
            // new BundleAnalyzerPlugin({
            //     analyzerMode: 'static',
            //     openAnalyzer: true,
            //     generateStatsFile: true,
            //     statsOptions: {source: false}
            // }),
        ],
    };
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
    if (env.board === true)     return `board`;
    if (env.blockly === true)   return `blockly`;
    if (env.timeline === true)  return `timeline`;
}

function getEntries(env) {
    // Bundle entries
    let entries = {};
    if (env.main === true)      entries['main'] = './app/js/index.js';
    if (env.board === true)     entries['board'] = './app/js/admin_board.js';
    if (env.blockly === true)   entries['blockly'] = './app/js/admin_blockly.js';
    if (env.timeline === true)  entries['timeline'] = './app/js/timeline.js';

    return entries;
}

function getCopypaths(env) {
    if (!dotenv.parsed) {
        console.warn("Nothing to copy.");
        return [];
    }

    // Copy paths
    let copypaths = [];

    if (env.main === true && dotenv.parsed.PATH_DIST_MAIN) {
        copypaths = [...copypaths,
            {from: './app/fonts/',          to: './fonts'},
            {from: './app/fonts/',          to: dotenv.parsed.PATH_DIST_MAIN + '/fonts'},
            {from: './app/css/spinner.css', to: './spinner.css'},
            {from: './app/css/spinner.css', to: dotenv.parsed.PATH_DIST_MAIN + '/css/spinner.css'},
            {from: './app/images/',         to: dotenv.parsed.PATH_DIST_MAIN + '/images'},
            {from: './dist/main.js',      to: dotenv.parsed.PATH_DIST_MAIN + '/js/main.js'},
        ];
    }

    if (env.board === true && dotenv.parsed.PATH_DIST_BOARD) {
        copypaths = [...copypaths,
            {from: './dist/board.js',     to: dotenv.parsed.PATH_DIST_BOARD + '/js/admin_board.js'}
        ];
    }
    if (env.board === true && dotenv.parsed.PATH_DIST_MONITOR) {
        copypaths = [...copypaths,
            {from: './dist/board.js',     to: dotenv.parsed.PATH_DIST_MONITOR + '/board.js'}
        ];
    }

    if (env.timeline === true && dotenv.parsed.PATH_DIST_MONITOR) {
        copypaths = [...copypaths,
            {from: './dist/timeline.js',     to: dotenv.parsed.PATH_DIST_MONITOR + '/timeline.js'}
        ];
    }

    if (env.blockly === true && dotenv.parsed.PATH_DIST_BLOCKLY) {
        copypaths = [...copypaths,
            {from: './dist/blockly.js',   to: dotenv.parsed.PATH_DIST_BLOCKLY + '/js/admin_blockly.js'},
        ];
    }

    return copypaths;
}

function getHtmlCopyPluginInstances(env) {
    // HTML Webpack files
    let htmls = [];
    if (env.main === true) {
        htmls = [...htmls,
            new HtmlWebpackPlugin({
                template: './app/html/index.html',
                inject: 'body'
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
    if (env.blockly === true) {
        htmls = [...htmls,
            new HtmlWebpackPlugin({
                template: './app/html/admin.html',
                inject: 'body',
                filename: 'admin.html'
            }),
        ];
    }
    if (env.timeline === true) {
        htmls = [...htmls,
            new HtmlWebpackPlugin({
                template: './app/html/timeline.html',
                inject: 'body',
                filename: 'timeline.html'
            }),
        ];
    }

    return htmls;
}