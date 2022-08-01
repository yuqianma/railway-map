import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/

export default defineConfig(({ command, mode }) => {
  return {
    base: "./",
    plugins: [react()],
    define: {
      // VITE_MapboxAccessToken: process.env.MapboxAccessToken
    }
  };
});
