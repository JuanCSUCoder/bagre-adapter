const path = require("path");

module.exports = {
  entry: "./src/index.js",
  mode: "production",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".cjs", ".mjs"],
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      assert: require.resolve("assert/"),
      stream: require.resolve("stream-browserify"),
      url: require.resolve("url/"),
      https: require.resolve("https-browserify"),
      http: require.resolve("stream-http"),
    },
  },
};