// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://baseimpact.org',
  output: 'static',
  adapter: cloudflare(),

  // Translation is handled client-side by visitors' browsers (Google Translate).
  // No built-in i18n routes are maintained.

  integrations: [sitemap()],
});