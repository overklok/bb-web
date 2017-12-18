var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './app/js/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
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
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/html/index.html',
      inject: 'body'
    })
  ]
};