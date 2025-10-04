import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Fail if port is not available instead of trying next port
    open: true, // Auto open browser
    host: true, // Allow external connections
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '387ae8fec03e.ngrok-free.app', // Your ngrok host
      '.ngrok-free.app', // Allow any ngrok-free.app subdomain
      '.ngrok.io', // Allow any ngrok.io subdomain (in case you use paid ngrok)
    ],
  },
})
