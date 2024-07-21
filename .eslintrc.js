module.exports = {
  root: true,
  parserOptions: {
    sourceType: "module",
    ecmaVersion: latest,
  },

  env: {
    es6: true,
  },
  rules: {
    // Windows linebreaks when not in prod environment
    "linebreak-style": [
      "error",
      require("os").EOL === "\r\n" ? "windows" : "unix",
    ],
  },
};
