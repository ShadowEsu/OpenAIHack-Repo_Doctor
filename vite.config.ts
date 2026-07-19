import { defineConfig } from 'vite';

export default defineConfig({
  // Relative assets work both from a Vercel deployment and from Electron's file:// protocol.
  base: './'
});
