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
    '/api/**': { proxy: { to: `${process.env.API_HOST ?? 'https://api.cbddev.xyz'}/**` } },
    '/translation-api/**': {
      proxy: {
        to: `${process.env.TRANSLATION_API_HOST ?? 'http://localhost:2012'}/translation-api/**`
      }
    }
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
  },

  experimental: {
    // With ssr:false, no SSR Vite server is created so vite:serverCreated(ctx.isServer)
    // never fires — NUXT_VITE_NODE_OPTIONS is never set and the renderer throws
    // "Vite Node IPC socket path not configured". viteEnvironmentApi:true resolves
    // the socket from the client server immediately, bypassing that code path.
    viteEnvironmentApi: true
  }
})
