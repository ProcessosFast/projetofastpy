import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Mostrado no rodapé para conferir se o navegador está com a versão publicada.
    __APP_VERSION__: JSON.stringify(
      `${(process.env.VERCEL_GIT_COMMIT_SHA ?? 'local').slice(0, 7)} · ${new Date().toLocaleString(
        'pt-BR',
        { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' },
      )}`,
    ),
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
