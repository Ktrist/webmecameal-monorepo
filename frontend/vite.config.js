import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // On force l'IPv4 (c'est souvent la cause du bug sur Mac)
    port: 3000,        // On change de port pour éviter les conflits cachés
  },
})