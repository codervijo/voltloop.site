import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://voltloop.site',
  integrations: [react(), sitemap()],
  vite: {
    ssr: {
      noExternal: ['@mui/material', '@mui/system', '@emotion/react', '@emotion/styled']
    }
  }
});
