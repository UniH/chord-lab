import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { alphaTab } from '@coderline/alphatab-vite';

// base 設為相對路徑,部署到 GitHub Pages 的任何 repo 名稱下都能運作
export default defineConfig({
  base: './',
  plugins: [react(), alphaTab()],
});
