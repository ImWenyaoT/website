/**
 * Returns the stylesheets that define the Site chrome design system.
 */
export function siteStyles(): string[] {
  return [
    '@fontsource-variable/geist/index.css',
    '@fontsource-variable/geist-mono/index.css',
    './src/styles/geist.css',
  ];
}
