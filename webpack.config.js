const HtmlPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

module.exports = {
  entry: [
    'babel-polyfill',
    './src/index.js',
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          plugins: ['transform-decorators-legacy'],
          presets: ['es2015', 'stage-0'],
        },
      },
    ],
  },
  resolve: {
    alias: {
      game: path.resolve(__dirname, 'src'),
    },
  },
  // devtool: 'cheap-module-source-map',
  target: 'web',
  plugins: [
    new HtmlPlugin(),
    new UglifyJSPlugin({
     minimize: true,
     compress: {
         warnings: false
     }
    }),
  ],
};
