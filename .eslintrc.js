module.exports = {
  root: true,
  extends: "standard",
  plugins: [
    "html"
  ],
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module"
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    jquery: true
  },
  rules: {
    "linebreak-style": [0, "error", "window"],
    "indent": ["error", 2],
    "semi": 0
  }
};
