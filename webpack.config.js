const HtmlPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const NODE_ENV = process.env.NODE_ENV;
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const config = {
  entry: ['babel-polyfill', './src/index.js', './src/main.scss'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    library: '[name]'
  },
  watch: true,
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
        { // regular css files
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({
                loader: 'css-loader?importLoaders=1',
            }),
        },
        { // sass / scss loader for webpack
            test: /\.(sass|scss)$/,
            loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
        }
    ],
  },
  resolve: {
    alias: {
      game: path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    new HtmlPlugin(),
    new ExtractTextPlugin('style.css')
  ],
  target: 'web',
};

if(process.env.NODE_ENV === 'production') {
    config.plugins.push(
        new UglifyJSPlugin({
            minimize: true,
            compress: {
                warnings: false,
                drop_console: true,
            }
        })
    );
} else {
    config.devtool = 'source-map';
}

module.exports = config;
