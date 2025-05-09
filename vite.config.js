import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
    }),
  ],
  define: { 
    'process.env': {},
    'global': 'globalThis', // Polyfill for Firebase
   },
  server: {
    port: 5173, // Default Vite dev server port
    proxy: {
      '/.auth': {
        target: 'http://localhost:9099',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/\.auth/, '')
      },
      '/firestore': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/firestore/, '')
      },
      '/storage': {
        target: 'http://localhost:9199',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/storage/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  /* remove the need to specify .vue files https://vitejs.dev/config/#resolve-extensions
  resolve: {
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ]
  },
  */
})
