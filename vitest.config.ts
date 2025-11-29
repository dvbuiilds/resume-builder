import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/app/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@resume-builder/lib': path.resolve(__dirname, './src/lib'),
      '@resume-builder/utils': path.resolve(__dirname, './src/utils'),
      '@resume-builder/components/resume-builder': path.resolve(
        __dirname,
        './src/components/resume-builder',
      ),
      '@resume-builder/llms': path.resolve(__dirname, './src/llms'),
      '@resume-builder/app': path.resolve(__dirname, './src/app'),
    },
  },
});
