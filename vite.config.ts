import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Alpha Fit Training',
        short_name: 'AlphaFit',
        description: 'Foco total, Alexandre! 🚀',
        theme_color: '#1b7a43', // O verde do seu botão principal
        background_color: '#f7fafc',
        display: 'standalone', // Remove a barra de endereço do navegador
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Ajuda o timer a não ser "congelado" pelo sistema do celular
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
})