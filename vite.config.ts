import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    tailwindcss(),
    solid(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      base: process.env.VITE_BASE_PATH || '/',

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: 'ic-frontend',
        short_name: 'ic-frontend',
        description: 'Graph based task manager',
        theme_color: '#333333',
        start_url: process.env.VITE_BASE_PATH || '/',
        scope: process.env.VITE_BASE_PATH || '/',
      },

      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },

      devOptions: {
        enabled: false,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },
    }),
  ],
});
