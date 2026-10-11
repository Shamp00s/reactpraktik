import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Фронт на 5173 ходит на /api как "к себе", Vite перенаправляет на Express (порт 4000).
      // Благодаря этому браузер не видит кросс-доменный запрос — cookie сессии
      // приходит и уходит без танцев с CORS.
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})