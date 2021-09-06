"use strict";

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  env: {
    node: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
};
