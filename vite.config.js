// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()], // Abilita il supporto per i file .vue
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'), // Punto di ingresso definito prima
      name: 'VueBottomSheet', // Nome globale UMD (se usato via <script>)
      fileName: (format) => `vue-bottom-sheet.${format}.js`, // Nome dei file di output
      formats: ['es', 'umd', 'cjs'] // Formati da generare (ES Module, UMD, CommonJS)
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
      output: {
        // Configurazione per l'output UMD/IIFE
        globals: {
          vue: 'Vue', // Mappa 'vue' alla variabile globale 'Vue'
          'vue-router': 'VueRouter' // Mappa 'vue-router' alla variabile globale 'VueRouter'
        },
      }
    },
  },
});