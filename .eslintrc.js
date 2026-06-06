module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'linebreak-style': 'off',
    'no-plusplus': 'off',
    'class-methods-use-this': 'off',
    'no-param-reassign': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
  },
}
