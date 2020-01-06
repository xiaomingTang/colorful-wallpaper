const path = require("path")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const autoprefixer = require("autoprefixer")
const tsImportPluginFactory = require("ts-import-plugin")

const Paths = require("./Paths")
const { isProduction } = require("./Constants")

const cssLoader = [
  isProduction ? MiniCssExtractPlugin.loader : "style-loader",
  "css-loader",
].filter(Boolean)

const postcssLoader = {
  loader: "postcss-loader",
  options: {
    plugins: [
      autoprefixer
    ]
  }
}

const sassLoader = {
  loader: "sass-loader",
  options: {
    sourceMap: !isProduction
  }
}

const cssModuleLoader = {
  loader: "typings-for-css-modules-loader",
  options: {
    modules: true,
    namedExport: true,
    camelCase: true,
    sass: true,
    minimize: true,
    localIdentName: "[local]_[hash:base64:5]"
  }
}

module.exports = {
  mode: isProduction ? "production" : "development",
  devtool: "cheap-module-source-map",
  entry: {
    // HtmlWebpackPlugin.Options.chunks 需要跟着entry一起改动, 指出该HtmlWebpackPlugin需要的chunks...
    index: path.resolve(Paths.Src, "index.tsx"),
    vendors: ["react", "react-dom"], // 很少变动的大型文件, 可以放在该vendors中, 并修改 webpack-optimization.js 中的 splitChunks.cacheGroups.vendors.test, 以经过splitChunks处理
  },
  output: {
    path: Paths.Dist,
    filename: "static/scripts/[name].[hash:6].js",
    chunkFilename: isProduction
      ? "static/scripts/chunk-[name].[chunkhash:6].js"
      : "static/scripts/chunk-[name].js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      "@Src": Paths.Src,
      "@Comps": Paths.Comps,
      "@ant-design/icons/lib/dist$": path.resolve(Paths.Src, "assets/icons/.antd-icons"),
    }
  },
  module: {
    rules: [
      {
        test: /\.antd-icons$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            }
          },
          // 这是一个我自用的antd图标按需加载插件
          // 配合alias将@ant-design/icons/lib/dist$重定向到我们自定义的.antd-icons文件中
          // 该文件实质上是一个json文件， 所需的antd图标需要手动在该文件中列出来
          // 详见 https://github.com/xiaomingTang/antd-icons-loader
          "antd-icons-loader",
        ]
      },
      {
        test: /\.[tj]sx?$/,
        // 如果 node_modules 中的文件需要经过压缩等处理的, 必须在该 include 中添加路径
        include: [ Paths.Src ],
        exclude: /\.min\.js$/,
        use: [
          // { // 如果需要babel可自主启用(需下载相应依赖)
          //   loader: "babel-loader",
          //   options: {
          //     plugins: [
          //       [
          //         "@babel/plugin-transform-runtime",
          //         {
          //           corejs: 2,
          //         }
          //       ]
          //     ],
          //     presets: [
          //       "@babel/preset-env",
          //       "@babel/react",
          //     ]
          //   }
          // },
          {
            loader: "ts-loader",
            options: {
              transpileOnly: !isProduction,
              getCustomTransformers: _ => ({
                before: [tsImportPluginFactory({
                  libraryDirectory: "es",
                  libraryName: "antd",
                  style: "css"
                })]
              }),
            },
          },
        ],
      },
      {
        test: /\.css$/,
        // 如果 node_modules 中的文件需要经过压缩/css-loader等处理的, 必须在该 include 中添加路径
        include: [Paths.Src, path.resolve(Paths.Root, "node_modules/antd")],
        use: cssLoader,
      },
      {
        test: /\.s(a|c)ss$/,
        include: Paths.Src,
        exclude: /\.module\.s(a|c)ss$/,
        use: [
          ...cssLoader,
          isProduction ? postcssLoader : null,
          sassLoader,
        ].filter(Boolean),
      },
      {
        test: /\.module\.s(a|c)ss$/,
        include: Paths.Src,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : "style-loader",
          cssModuleLoader,
          isProduction ? postcssLoader : null,
          sassLoader,
        ].filter(Boolean),
      },
      {
        test: /\.(png|jpg|jpeg|gif|ico)(\?.*)?$/i,
        include: Paths.Src,
        use: [{
          loader: "url-loader",
          options: {
            limit: 8192,
            name: "static/images/[name].[hash:6].[ext]"
          }
        }]
      },
      {
        test: /\.(otf|eot|svg|ttf|woff)(\?.*)?$/i,
        include: Paths.Src,
        use: [{
          loader: "url-loader",
          options: {
            limit: 8192,
            name: "static/fonts/[name].[hash:6].[ext]"
          }
        }]
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i,
        include: Paths.Src,
        loader: 'url-loader',
        options: {
          limit: 8192,
          name: 'static/medias/[name].[hash:8].[ext]' // 文件名
        }
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(Paths.Public, "index.html"),
      filename: "index.html",
      title: "花样壁纸",
      inject: "body",
      chunks: ["index", "vendors"],
      favicon: path.join(Paths.Public, "favicon.ico"),
      hash: true,
    }),
    isProduction ? new MiniCssExtractPlugin({
      filename: "static/styles/[name].[hash:6].css",
    }) : null,
    new webpack.WatchIgnorePlugin([/\.d\.ts$/]),
    new webpack.LoaderOptionsPlugin({
      options: {
        libraryTarget: "umd",
      }
    })
  ].filter(Boolean),
}
