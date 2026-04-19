import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Обов'язково для Docker, щоб прокинути порт назовні
    port: 5173,
    watch: {
      usePolling: true // Допомагає Docker бачити зміни у файлах
    }
  }
})