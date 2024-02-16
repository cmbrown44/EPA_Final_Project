// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  root: resolve(__dirname, 'src/pages/home'),
  publicDir: resolve(__dirname, 'public'),
  plugins: [react()],
  server: {
    port: 8000,
  },
  build: {
    outDir: resolve(__dirname, './lib'),
    assetsDir: '',
    rollupOptions: {
      input: {
        home: resolve(__dirname, '/index.html')
      },
    },
    chunkSizeWarningLimit: 1600
  },
});
