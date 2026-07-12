/** @type {import('markdownlint-cli2').Configuration} */
export default {
  globs: ['**/*.md', '**/*.mdx', '!node_modules/**', '!.cache/**', '!.venv/**', '!dist/**'],
  config: {
    default: true,
    MD013: false,
    MD024: { siblings_only: true },
    MD025: false,
    MD033: false,
    MD036: false,
    MD040: false,
    MD041: false,
    MD046: false,
  },
};
