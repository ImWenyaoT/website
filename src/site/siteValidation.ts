import starlightLinksValidator from 'starlight-links-validator';

/**
 * Returns Site chrome validation adapters that run during Starlight builds.
 */
export function siteValidation() {
  return [starlightLinksValidator({ errorOnRelativeLinks: false })];
}
