const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const distDir = path.resolve(__dirname, 'dist/examples');

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  target: 'web',
  entry: {
    demo: './examples/demo/main.ts',
    // basic: './examples/basic/main.ts',
    // complex: './examples/complex/main.ts',
    // layout: './examples/layout/main.ts',
    // media: './examples/media/main.ts',
    // imperative: './examples/imperative/main.ts',
    // zonejs: './examples/zonejs/main.ts',
    // tabs: './examples/tabs/main.ts',
  },
  output: {
    path: distDir,
    filename: (pathData) => {
      return pathData.chunk.name === 'demo' && process.env.WEBPACK_SERVE ? 'assets/[name].js' : 'assets/[name].[contenthash:8].js';
    },
    publicPath: '/',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    // plugins: [new TsconfigPathsPlugin({
    //   configFile: 'tsconfig.json',
    // })],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.examples.json',
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        resourceQuery: { not: [/inlineText/] },
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        resourceQuery: { not: [/inlineText/] },
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },

      // https://stackoverflow.com/questions/42631645/webpack-import-typescript-module-both-normally-and-as-raw-string
      {
        // test: /.*\/inlineText\/.*/,
        resourceQuery: /inlineText/,
        type: 'asset/source',
      },
      {
        resourceQuery: /inlineScss/,
        type: 'asset/source',
        use: [
          'sass-loader'
        ]
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: 'tsconfig.examples.json',
      },
    }),
    new HtmlWebpackPlugin({
      filename: 'demo.html',
      template: './examples/demo/template.html',
      chunks: ['demo'],
      inject: 'body',
    }),
    // new HtmlWebpackPlugin({
    //   filename: 'basic.html',
    //   template: './examples/basic/template.html',
    //   chunks: ['basic'],
    //   inject: 'body',
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'signal-state.html',
    //   template: './examples/basic/signal-state-template.html',
    //   chunks: ['basic'],
    //   inject: 'body',
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'complex.html',
    //   template: './examples/complex/template.html',
    //   chunks: ['complex'],
    //   inject: 'body',
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'layout.html',
    //   template: './examples/layout/template.html',
    //   chunks: ['layout'],
    //   inject: 'body',
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'media.html',
    //   template: './examples/media/template.html',
    //   chunks: ['media'],
    //   inject: 'body',
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'imperative.html',
    //   template: './examples/imperative/template.html',
    //   chunks: ['imperative'],
    //   inject: 'body',
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'zonejs.html',
    //   template: './examples/zonejs/template.html',
    //   chunks: ['zonejs'],
    //   inject: 'body',
    // }),
    // new HtmlWebpackPlugin({
    //   filename: 'tabs.html',
    //   template: './examples/tabs/template.html',
    //   chunks: ['tabs'],
    //   inject: 'body',
    // }),
  ],
  devServer: {
    static: {
      directory: distDir,
      publicPath: '/',
    },
    port: 8086,
    open: ['demo.html'],
    hot: true,
    liveReload: false,
  },
};
