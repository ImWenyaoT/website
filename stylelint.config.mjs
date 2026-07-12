/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['dist/**', '.cache/**', '.venv/**', 'node_modules/**', 'public/**'],
  rules: {
    'custom-property-pattern': null,
    'no-descending-specificity': null,
    'selector-class-pattern': null,
  },
};
