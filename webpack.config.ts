/**
 * webpack configuration
 */
const path = require('path');
const { createRequire } = require('module');

const requireModule = createRequire(__filename);
const webpack = requireModule('webpack');
const { VueLoaderPlugin } = requireModule('vue-loader');
const TerserPlugin = requireModule('terser-webpack-plugin');

const dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV == 'production';

const locales = requireModule('./locales');
const meta = requireModule('./package.json');

const postcss = {
	loader: 'postcss-loader',
	options: {
		postcssOptions: {
			plugins: [
				requireModule('cssnano')({
					preset: 'default'
				})
			]
		},
	},
};

module.exports = {
	entry: {
		app: './src/client/init.ts',
		sw: './src/client/sw.js'
	},
	module: {
		rules: [{
			test: /\.vue$/,
			exclude: /node_modules/,
			use: [{
				loader: 'vue-loader',
				options: {
					cssSourceMap: false,
					compilerOptions: {
						preserveWhitespace: false
					}
				}
			}, {
				loader: 'vue-svg-inline-loader'
			}]
		}, {
			test: /\.scss?$/,
			exclude: /node_modules/,
			oneOf: [{
				resourceQuery: /module/,
				use: [{
					loader: 'vue-style-loader'
				}, {
					loader: 'css-loader',
					options: {
						modules: true,
						esModule: false,
						url: false,
					}
				}, postcss, {
					loader: 'sass-loader',
					options: {
						implementation: requireModule('sass'),
					}
				}]
			}, {
				use: [{
					loader: 'vue-style-loader'
				}, {
					loader: 'css-loader',
					options: {
						url: false,
						esModule: false
					}
				}, postcss, {
					loader: 'sass-loader',
					options: {
						implementation: requireModule('sass'),
					}
				}]
			}]
		}, {
			test: /\.css$/,
			use: [{
				loader: 'vue-style-loader'
			}, {
				loader: 'css-loader',
				options: {
					esModule: false,
				}
			}, postcss]
		}, {
			test: /\.(eot|woff|woff2|svg|ttf)([?]?.*)$/,
			loader: 'url-loader'
		}, {
			test: /\.ts$/,
			exclude: /node_modules/,
			use: [{
				loader: 'ts-loader',
				options: {
					happyPackMode: true,
					transpileOnly: true,
					configFile: dirname + '/src/client/tsconfig.json',
					appendTsSuffixTo: [/\.vue$/]
				}
			}]
		}]
	},
	plugins: [
		new webpack.ProgressPlugin({}),
		new webpack.DefinePlugin({
			_VERSION_: JSON.stringify(meta.version),
			_LANGS_: JSON.stringify(Object.entries(locales).map(([k, v]: [string, any]) => [k, v && v.meta && v.meta.lang])),
			_ENV_: JSON.stringify(process.env.NODE_ENV)
		}),
		new VueLoaderPlugin(),
	],
	output: {
		path: dirname + '/built/client/assets',
		filename: `[name].js`,
		publicPath: `/assets/`
	},
	resolve: {
		extensions: [
			'.js', '.ts', '.json'
		],
		alias: {
			'const.styl': dirname + '/src/client/const.styl'
		}
	},
	resolveLoader: {
		modules: ['node_modules']
	},
	externals: {
		moment: 'moment'
	},
	optimization: {
		minimizer: [new TerserPlugin({
			parallel: 1
		})]
	},
	devtool: false, //'source-map',
	mode: isProduction ? 'production' : 'development'
};

export {};
