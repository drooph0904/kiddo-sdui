// Flat ESLint config built on Expo's shared rules.
// Run with: npm run lint
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
];
