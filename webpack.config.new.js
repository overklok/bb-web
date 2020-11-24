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
    resolveEnvEntries(env);

    const no_copy = !!argv.liveReload;
    const is_dev = argv.mode === "development";
    const [ver, tgt, mode] = [getVersionNumber(), getVersionTarget(env), getVersionMode(argv.mode)]
    const VERSION = mode ? `${tgt}/${ver}-${mode} [new]` : `${tgt}/${ver} [new]`;

    console.info("Building", VERSION);

    return {
        entry: getEntries(env),
        devtool: is_dev ? 'eval-source-map' : 'eval-cheap-source-map',
        optimization: {
            minimizer: getMinimizer(is_dev)
        },
        output: {
            publicPath: "/"
        },
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            historyApiFallback: {
                index: '/',
            },
            index: getHtmlIndexFile(env),
            compress: true,
            port: 9000
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
            extensions: ['.tsx', '.ts', '.js'],
            modules: [path.resolve(__dirname, './app'), 'node_modules']
        },
        plugins: [
            ...getHtmlCopyPluginInstances(env),
            new BuildNotifierPlugin({
                title: "Tapanda [New]",
                logo: path.resolve("./img/favicon.png"),
            }),
            new webpack.ProvidePlugin({
                $: 'jquery',
            }),
            new CopyWebpackPlugin(getCopypaths(env, is_dev, no_copy)),
            new webpack.DefinePlugin({
                '__VERSION__': `'${VERSION}'`,
            }),
        ]
    }
};

function getMinimizer(is_dev) {
    if (is_dev) return [];

    return [new TerserPlugin({
        cache: !is_dev,
        parallel: true,
        sourceMap: is_dev,
    })];
}

function resolveEnvEntries(env) {
    if (env.all) {
        console.warn("WARNING: 'main' entry has been temporarily excluded for mixed build");
        // env.main = true;
        env.board = true;
        env.monkey = true;
        env.playground = true;
    }
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

function getHtmlIndexFile(env) {
    if (env.main === true) return 'main.html';
    if (env.board === true) return 'board.html';
    if (env.monkey === true) return 'monkey.html';
    if (env.playground === true) return 'playground.html';
}

function getCopypaths(env, is_dev, no_copy) {
    if (!dotenv.parsed || no_copy) {
        console.warn("Nothing to copy.");
        return [];
    }

    const settings = [
        {
            enable: env.board === true,
            paths: [
                dotenv.parsed.PATH_DIST_BOARD,
                dotenv.parsed.PATH_DIST_BOARD_SOCK,
                dotenv.parsed.PATH_DIST_BOARD_ADMIN
            ],
            entry: 'board'
        },
        {
            enable: env.monkey === true,
            paths: [dotenv.parsed.PATH_DIST_MONKEY],
            entry: 'monkey'
        },
        {
            enable: env.playground === true,
            paths: [dotenv.parsed.PATH_DIST_PLAYGROUND],
            entry: 'playground'
        }

    ]

    console.log("Copy settings", settings);

    // Copy paths
    let copypaths = [];

    for (const setting of settings) {
        for (const path of setting.paths) {
            if (setting.enable && path) {
                copypaths = [...copypaths,
                    {
                        from: `./dist/${setting.entry}.js`,
                        to: path + `/${setting.entry}.js`
                    },
                ];

                if (is_dev) {
                    copypaths = [...copypaths,
                        {
                            from: `./dist/${setting.entry}.js.map`,
                            to: path + `/${setting.entry}.js.map`
                        },
                    ];
                }
            }
        }
    }

    return copypaths;
}