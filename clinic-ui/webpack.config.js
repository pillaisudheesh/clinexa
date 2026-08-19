const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",

  entry: "./src/main.tsx",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    clean: true,
    publicPath: "/",
  },

  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],

    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },

      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "@tailwindcss/webpack"],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],

  devServer: {
    port: 3001,

    historyApiFallback: true,

    hot: true,

    open: true,

    static: {
      directory: path.join(__dirname, "public"),
    },
  },
};
