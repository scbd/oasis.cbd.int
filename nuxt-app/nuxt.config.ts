// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: false,

  future: {
    compatibilityVersion: 4
  },

  modules: ['@pinia/nuxt', '@vueuse/nuxt', '@nuxt/eslint'],

  runtimeConfig: {
    apiHost: '',
    accountsUrl: '',
    encryptionPassword: '',
    public: {
      apiBase: '/api',
      accountsUrl: ''
    }
  },

  routeRules: {
    '/api/**': { proxy: { to: `${process.env.API_HOST ?? 'https://api.cbddev.xyz'}/**` } }
  },

  css: ['@tabler/core/dist/css/tabler.min.css', '~/assets/css/app.css'],

  typescript: {
    strict: true,
    typeCheck: false
  },

  eslint: {
    config: {
      stylistic: false
    }
  }
})
