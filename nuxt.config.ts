// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // app offline di HP: tanpa SSR, data di perangkat
  ssr: false,
  modules: ['@nuxtjs/ionic', '@nuxt/icon'],
  // CSS Ionic diimpor manual di main.css dalam layer, supaya class Tailwind tidak kalah
  ionic: { css: { core: false, basic: false, utilities: false } },
  // ikon dibundel ke app (offline), tidak mengambil dari internet
  icon: {
    provider: 'none',
    // CSS ikon (width/height 1em) masuk layer base, supaya class ukuran Tailwind (size-6, dst.) menang
    cssLayer: 'base',
    clientBundle: { scan: { globInclude: ['app/**/*.{vue,ts}'] }, sizeLimitKb: 512 },
  },
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  app: { head: { title: 'Asuh', htmlAttrs: { lang: 'id' } } },
})
