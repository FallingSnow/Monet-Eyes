import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const ENV = process.env.NODE_ENV || 'development';

const imageLoaderSettings = {

    progressive: true,
    optipng: {
        optimizationLevel: 7
    },
    pngquant: {
        quality: '65-90',
        speed: 4
    }
};

const config = {
    context: path.resolve(__dirname, "src"),
    entry: './index.js',

    output: {
        path: path.resolve(__dirname, "build"),
        publicPath: '',
        filename: 'bundle.js'
    },

    resolve: {
        extensions: ['.jsx', '.js', '.json', '.less']
    },

    module: {
        rules: [{
            enforce: 'pre',
            test: /\.jsx?$/,
            exclude: [/src\//, /node_modules\/intl-/],
            loader: 'source-map-loader'
        }, {
            test: /\.(xml|html|txt|md)$/,
            loader: 'raw-loader'
        }, {
            test: /\.(jpe?g|png|gif)$/i,
            loaders: [
                'file-loader?hash=sha512&digest=hex&name=/img/[hash].[ext]',
                {
                    loader: 'image-webpack-loader',
                    query: imageLoaderSettings
                }
            ]
        }, {
            test: /\.css$/,
            loader: "style-loader!css-loader"
        }, {
            test: /\.less$/,
            loader: "style-loader!css-loader!less-loader"
        }, {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }, {
            test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: "url-loader?limit=10000&minetype=application/font-woff"
        }, {
            test: /\.(ttf|eot|svg|flif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: "file-loader"
        }],
        noParse: [new RegExp('node_modules/localforage/dist/localforage.js')]
    },

    plugins: ([
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(ENV)
            }),
            new CopyWebpackPlugin([{
                from: '../third_party/libflif/*',
                flatten: true
            }]),
            new HtmlWebpackPlugin({
                template: './index.html',
                minify: {
                    collapseWhitespace: true
                }
            })
        ])
        .concat(ENV === 'production' ? [
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin()
        ] : []),

    stats: {
        colors: true
    },

    // devtool: ENV === 'production' ? 'source-map' : 'cheap-module-eval-source-map',
    devtool: '#inline-source-map',

    devServer: {
        port: process.env.PORT || 8080,
        host: '0.0.0.0',
        publicPath: '/',
        contentBase: './src',
        historyApiFallback: true,
        proxy: {
            // OPTIONAL: proxy configuration:
            // '/optional-prefix/**': { // path pattern to rewrite
            //	 target: 'http://target-host.com',
            //	 pathRewrite: path => path.replace(/^\/[^\/]+\//, '')   // strip first path segment
            // }
        }
    }
};

module.exports = config;
