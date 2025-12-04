import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    // Désactive le cache du navigateur en dev pour éviter les problèmes
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  // Force le rechargement des variables d'environnement
  envPrefix: 'VITE_',
})