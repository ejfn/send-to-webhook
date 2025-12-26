import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, cpSync } from 'fs';

const browser = process.env.BROWSER || 'chrome';

export default defineConfig({
    publicDir: false, // We copy assets manually to avoid extra manifest files
    build: {
        rollupOptions: {
            input: {
                options: resolve(__dirname, 'src/options.html'),
                background: resolve(__dirname, 'src/background.ts'),
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    // Put background.js in scripts/ folder to match existing structure
                    if (chunkInfo.name === 'background') {
                        return 'scripts/[name].js';
                    }
                    return 'scripts/[name].js';
                },
                chunkFileNames: 'scripts/[name].js',
                assetFileNames: '[name].[ext]'
            }
        },
        outDir: `dist-${browser}`,
        emptyOutDir: true
    },
    plugins: [{
        name: 'copy-manifest-and-assets',
        closeBundle() {
            // Copy browser-specific manifest
            copyFileSync(
                resolve(__dirname, `public/manifest.${browser}.json`),
                resolve(__dirname, `dist-${browser}/manifest.json`)
            );
            // Copy assets (images and css)
            cpSync(
                resolve(__dirname, 'public/assets'),
                resolve(__dirname, `dist-${browser}/assets`),
                { recursive: true }
            );
        }
    }]
});
