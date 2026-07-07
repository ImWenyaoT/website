import type { StarlightUserConfig } from '@astrojs/starlight/types';
import { siteSidebar } from './siteSidebar';
import { siteStyles } from './siteStyles';
import { siteValidation } from './siteValidation';

/**
 * Returns the Site chrome options consumed by Starlight.
 */
export function siteChrome(): StarlightUserConfig {
  return {
    title: 'Tian "Edward" Wenyao',
    description: 'Model、Harness 与更多学习笔记。',
    plugins: siteValidation(),
    customCss: siteStyles(),
    sidebar: siteSidebar(),
  };
}
