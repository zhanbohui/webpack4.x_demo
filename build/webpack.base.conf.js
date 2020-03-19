const path = require('path')
const webpack = require('webpack')
const glob = require('glob')
// 消除冗余的css
const PurifyCssWebpack = require('purifycss-webpack')
// html模板
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 静态资源输出
const CopyWebpackPlugin = require('copy-webpack-plugin')
// const rules = require("./webpack.rules.conf.js");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const devMode = process.env.NODE_ENV !== 'production'
// 获取html-webpack-plugin参数的方法
const getHtmlConfig = function (name, chunks) {
  return {
    template: `./src/pages/${name}/index.html`,
    filename: `${name}.html`,
    // favicon: './favicon.ico',
    // title: title,
    inject: true,
    hash: true, // 开启hash  ?[hash]
    chunks: chunks,
    minify: process.env.NODE_ENV === 'development' ? false : {
      removeComments: true, // 移除HTML中的注释
      collapseWhitespace: true, // 折叠空白区域 也就是压缩代码
      removeAttributeQuotes: true // 去除属性引用
    }
  }
}

// 动态添加入口
function getEntry (PAGES_DIR) {
  const entry = {};
  // 读取src目录所有page入口
  glob.sync(PAGES_DIR + '**/*.js').forEach(function (name) {
    const start = name.indexOf('pages/') + 4;
    const end = name.length - 3;
    const eArr = [];
    let n = name.slice(start, end);
    n = n.split('/')[1]
    eArr.push(name)
    entry[n] = eArr
  })
  return entry
}
const entrys = getEntry('./src/pages/')
module.exports = {
  entry: entrys,
  module: {
    rules: [{
      test: /\.(css|scss|sass)$/,
      use: [
        devMode ? 'style-loader' : {
          loader: MiniCssExtractPlugin.loader,
          options: {
            // you can specify a publicPath here
            // by default it use publicPath in webpackOptions.output
            publicPath: '../'
          }
        },
        'css-loader',
        'postcss-loader',
        'sass-loader'
      ]
    },
    {
      test: /\.js$/,
      use: [
        {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        }
      ],
      enforce: 'pre',
      exclude: /node_modules/,
      include: [path.resolve(__dirname, '../src')]
    },
    {
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        options: {
          cacheDirectory: true // 利用缓存
        }
      }],
      // 不检查node_modules下的js文件
      exclude: '/node_modules/',
      include: [path.resolve(__dirname, '../src')]
    }, {
      test: /\.(png|jpg|gif)$/,
      use: [{
        // 需要下载file-loader和url-loader
        loader: 'url-loader',
        options: {
          limit: 5 * 1024, // 小于这个时将会已base64位图片打包处理
          // 图片文件输出的文件夹
          outputPath: 'images'
        }
      }]
    },
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000
      }
    },
    {
      test: /\.html$/,
      // html中的img标签
      use: ['html-withimg-loader']
    }, {
      test: /\.less$/,
      use: [
        devMode ? 'style-loader' : {
          loader: MiniCssExtractPlugin.loader,
          options: {
            // you can specify a publicPath here
            // by default it use publicPath in webpackOptions.output
            publicPath: '../'
          }
        },
        'css-loader',
        'postcss-loader',
        'less-loader'
      ]
    }
    ]
  },
  // 将外部变量或者模块加载进来
  externals: {
    // 'jquery': 'window.jQuery'
  },
  plugins: [
    // 全局暴露统一入口
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    // 静态资源输出
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, '../src/assets'),
      to: './assets',
      ignore: ['.*']
    }]),
    // 消除冗余的css代码
    new PurifyCssWebpack({
      paths: glob.sync(path.join(__dirname, '../src/pages/*/*.html'))
    })

  ]
  // webpack4里面移除了commonChunksPulgin插件，放在了config.optimization里面,提取js， vendor名字可改
  // optimization: {
  // 	splitChunks: {
  // 		cacheGroups: {
  // 			vendor: {
  // 				// test: /\.js$/,
  // 				test: path.resolve(__dirname, '../node_modules'),
  // 				chunks: "initial", //表示显示块的范围，有三个可选值：initial(初始块)、async(按需加载块)、all(全部块)，默认为all;
  // 				name: "vendor", //拆分出来块的名字(Chunk Names)，默认由块名和hash值自动生成；
  // 				minChunks: 1,
  // 				reuseExistingChunk: true,
  // 				enforce: true
  // 			}
  // 		}
  // 	}
  // },
}

// 修改   自动化配置页面
const htmlArray = []
Object.keys(entrys).forEach(function (element) {
  htmlArray.push({
    _html: element,
    title: '',
    chunks: [element]
  })
})

// 自动生成html模板
htmlArray.forEach((element) => {
  module.exports.plugins.push(new HtmlWebpackPlugin(getHtmlConfig(element._html, element.chunks)))
})
