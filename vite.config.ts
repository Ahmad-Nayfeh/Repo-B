import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import preact from '@preact/preset-vite';

/** Emits sw.js with the full list of built files so the app works offline after the first visit. */
function serviceWorker(): Plugin {
  return {
    name: 'munazara-sw',
    apply: 'build',
    generateBundle(_opts, bundle) {
      const files = Object.keys(bundle).filter((f) => !f.endsWith('.map'));
      const pub = ['index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'frame-guard.js',
        'fonts/plex-arabic-arabic-400.woff2', 'fonts/plex-arabic-arabic-600.woff2', 'fonts/plex-arabic-latin-400.woff2', 'fonts/plex-arabic-latin-600.woff2'];
      const assets = ['./', ...[...new Set([...files, ...pub])].map((f) => `./${f}`)];
      const version = Date.now().toString(36);
      const src = readFileSync(new URL('./src/sw-template.js', import.meta.url), 'utf8')
        .replace('__VERSION__', version).replace('__ASSETS__', JSON.stringify(assets));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: src });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [preact(), serviceWorker()],
  build: {
    target: 'es2022',
    sourcemap: false,
    assetsInlineLimit: 0,
    modulePreload: { polyfill: false },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['tests/unit/setup.ts'],
  },
} as never);
