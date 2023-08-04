/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const swEditor = require('@kie-tools/serverless-workflow-diagram-editor-assets');

module.exports = () => {
  return {
    mode: 'development',
    devtool: 'inline-source-map',
    ignoreWarnings: [/Failed to parse source map/],
    entry: {
      'envelope/serverless-workflow-diagram-editor-envelope':
        './envelope/ServerlessWorkflowDiagramEditorEnvelopeApp.ts',
      'envelope/serverless-workflow-combined-editor-envelope':
        './envelope/ServerlessWorkflowCombinedEditorEnvelopeApp.ts',
      'envelope/serverless-workflow-text-editor-envelope':
        './envelope/ServerlessWorkflowTextEditorEnvelopeApp.ts',
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            context: './envelope',
            from: '*.html',
            to: './envelope',
          },
          {
            from: swEditor.swEditorPath(),
            to: './diagram',
            globOptions: { ignore: ['**/WEB-INF/**/*'] },
          },
        ],
      }),
      new FileManagerPlugin({
        events: {
          onEnd: {
            delete: ['./public/swf/'],
            mkdir: ['./public/swf/'],
            copy: [
              {
                source:
                  './dist/vendors-node_modules_monaco-editor_esm_vs_language_json_jsonMode_js.bundle.js',
                destination: './public/',
              },
              { source: './dist/json.worker.js', destination: './public/' },
              {
                source: './dist/editor.worker.js',
                destination: './public/',
              },
              { source: './dist/diagram', destination: './public/swf/diagram' },
              { source: './dist/envelope', destination: './public/swf' },
              { source: './dist/fonts', destination: './public/fonts' },
            ],
          },
        },
      }),
      new MonacoWebpackPlugin({
        languages: ['json'],
      }),
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          use: [require.resolve('source-map-loader')],
        },
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.(tsx|ts)?$/,
          include: [path.resolve(__dirname, 'envelope')],
          use: [
            {
              loader: 'ts-loader',
              options: {
                configFile: path.resolve('./tsconfig.json'),
                allowTsInNodeModules: true,
              },
            },
          ],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            require.resolve('style-loader'),
            require.resolve('css-loader'),
            require.resolve('sass-loader'),
          ],
        },
        {
          test: /\.css$/,
          use: [require.resolve('style-loader'), require.resolve('css-loader')],
        },
        {
          test: /\.(svg|ttf|eot|woff|woff2)$/,
          use: {
            loader: 'file-loader',
            options: {
              limit: 5000,
              outputPath: 'fonts',
              name: '[name].[ext]',
            },
          },
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      chunkFilename: '[name].bundle.js',
      sourceMapFilename: '[name].js.map',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      modules: [path.resolve('../../node_modules')],
      fallback: {
        path: require.resolve('path-browserify'),
      },
    },
  };
};
