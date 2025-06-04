/* *************************************************
 *
 * WEBPACK CONFIGURATION
 *
 * This configuration build the game, history and support the @twg package
 *
************************************************* */

const webpack = require('webpack')
const path = require('path')
const { merge } = require("webpack-merge")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const packageJson = require(path.resolve(process.cwd(), 'package.json'))

const GAME_SLUG = packageJson.name || 'game'
const GAME_VERSION = packageJson.version || '1.0.0'

const OUTPUT_ROOT = path.resolve(process.cwd(), `${GAME_SLUG}/${GAME_VERSION}`)
const RELEASE_FOLDER = `release_${GAME_VERSION}`

// Common configuration
const commonConfig = (env, argv) => {
  return {
    module: {
      rules: [
        {
          test: /\.(ts|tsx)?$/,
          use: 'ts-loader',
          exclude: /(node_modules)(?![\\/](@twg)[\\/]).*/,
        },
        {
          test: /\.(css|scss)$/i,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ['@svgr/webpack'],
        },
        {
          test: /\.(png|jpg|jpeg|gif|webp)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(mp3|mp4)$/,
          use: 'file-loader',
        },
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        ...(Object.keys(packageJson.dependencies).reduce((acc, key) => {
          acc[key] = path.resolve('./node_modules', key);
          return acc;
        }, {}))
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.LOCAL': JSON.stringify(String(env.LOCAL || false)),
      })
    ],
    optimization: {
      minimize: true,
      splitChunks: false,
    },
  }
}

// Game build config
const indexConfig = (env, argv) => {
  return merge(commonConfig(env, argv), {
    name: 'index',
    entry: path.resolve(process.cwd(), 'src/index.tsx'),
    output: {
      path: path.resolve(OUTPUT_ROOT, RELEASE_FOLDER),
      filename: 'require.js',
      clean: true,
      assetModuleFilename: 'resources/[name].[contenthash][ext]',
    },
    devServer: {
      static: path.resolve(OUTPUT_ROOT, RELEASE_FOLDER),
      port: 8080
    },
    plugins: [
      ...(env.LOCAL ? [
        new HtmlWebpackPlugin({
          title: `${GAME_SLUG} ${GAME_VERSION}`,
          template: path.resolve(__dirname, 'index.html'),
        })
      ] : []),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(process.cwd(), 'resources'),
            to: path.resolve(OUTPUT_ROOT, RELEASE_FOLDER, 'resources'),
          },
          {
            from: path.resolve(process.cwd(), 'package.json'),
            to: path.resolve(OUTPUT_ROOT, 'package.json'),
          },
          {
            from: path.resolve(process.cwd(), 'CHANGELOG.md'),
            to: path.resolve(OUTPUT_ROOT, 'CHANGELOG.md'),
          }
        ],
      }),
    ],
  })
}

module.exports = (customIndexConfig = {}) => {
  return [
    (...args) => merge(indexConfig(...args), customIndexConfig),
  ]
}
