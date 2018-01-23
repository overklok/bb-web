var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var lib_dir = __dirname + '/vendor/js';

module.exports = {
  entry: './app/js/index.js',
  devtool: 'eval-source-map', // 'source-map' for production
  output: {
    filename: 'bundle.js',
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
      {
        loader: 'jshint-loader',
        test: /\.js$/,  // запустить загрузчик во всех файлах .js
        exclude: /node_modules/ // игнорировать все файлы в папке node_modules
      },
      {
        loader: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        loaders: ['style-loader', 'css-loader'],
        test: /\.css/,
        exclude: /node_modules/
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
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/html/index.html',
      inject: 'body'
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
  ]
};
