import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM-safe __dirname (karena package.json pakai "type":"module")
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// =============================================================
// VIRTUAL DIRECTORY / PATH ALIASING / URL MASKING
// -------------------------------------------------------------
// resolve.alias melindungi struktur direktori dari exposure:
//   @  → src/               (ganti ../../../ dengan @/...)
//   @c → src/components/    (komponen internal tidak terekspos)
//   @s → src/services/      (service layer tersembunyi)
//   @p → src/pages/         (routing tidak mencerminkan struktur disk)
//   @u → src/utils/         (utility path di-mask)
//
// Proxy server (URL masking) menyembunyikan origin backend:
//   /api     → http://localhost:3001   (client tidak tahu port backend)
//   /uploads → http://localhost:3001   (file server di-mask)
// =============================================================

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@':  path.resolve(__dirname, './src'),
      '@c': path.resolve(__dirname, './src/components'),
      '@s': path.resolve(__dirname, './src/services'),
      '@p': path.resolve(__dirname, './src/pages'),
      '@u': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (p) => p,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (p) => p,
      },
    },
  },
})
