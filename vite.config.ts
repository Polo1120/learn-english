import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'm6rgye-ip-186-118-197-28.tunnelmole.net'
    ]
  },
})
