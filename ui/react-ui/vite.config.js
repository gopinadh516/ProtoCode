import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '', // This is still essential!
  build: {
    outDir: 'dist',
    assetsDir: '',
    rollupOptions: {
      input: 'src/main.jsx', // Or your entry point
      output: {
        entryFileNames: 'bundle.js',
        format: 'iife',
        // Force relative paths for assets (the fix!)
        assetFileNames: ({ name }) => {
          return `assets/${name}.[hash].js`; // Or any other structure you prefer
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});