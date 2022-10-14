import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { createHtmlPlugin } from "vite-plugin-html"

const base = process.env.NODE_ENV === 'production'  ? "/todayMeal"  : "/"
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "192.168.6.174"
  },
  base,
  publicDir: "./public",
  plugins: [vue(), vueJsx(), createHtmlPlugin({
    minify: true,
    inject: {
      data: {
        title: "今天吃什么",
        base
      }
    }
  })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
