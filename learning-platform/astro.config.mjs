// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://vineet-singh0.github.io',
  base: '/enterprise-genai-engineering/',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
