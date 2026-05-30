import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://pmf.karmait.net',
  integrations: [
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
});
