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
        theme_color: '#1b7a43',
        background_color: '#f7fafc',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            // Ajustado para o nome real do arquivo na sua pasta public
            src: 'icon-192.png', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            // Ajustado para o nome real do arquivo na sua pasta public
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  // --- ADICIONE ESTE BLOCO ABAIXO PARA LIBERAR O LOCALTUNNEL ---
  server: {
    allowedHosts: [
      '.loca.lt', // Isso libera qualquer link gerado pelo localtunnel
      'pink-lamps-camp.loca.lt' 
    ]
  }
})