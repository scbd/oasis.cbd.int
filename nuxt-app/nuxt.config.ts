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
    // Versioned CBD API endpoints — proxied to CBD_API_HOST (defaults to production)
    '/api/v2013/**': {
      proxy: { to: `${process.env.CBD_API_HOST ?? 'https://api.cbd.int'}/api/v2013/**` }
    },
    '/api/v2015/**': {
      proxy: { to: `${process.env.CBD_API_HOST ?? 'https://api.cbd.int'}/api/v2015/**` }
    },
    '/api/v2016/**': {
      proxy: { to: `${process.env.CBD_API_HOST ?? 'https://api.cbd.int'}/api/v2016/**` }
    },
    '/api/v2017/**': {
      proxy: { to: `${process.env.CBD_API_HOST ?? 'https://api.cbd.int'}/api/v2017/**` }
    },
    '/api/v2018/**': {
      proxy: { to: `${process.env.CBD_API_HOST ?? 'https://api.cbd.int'}/api/v2018/**` }
    },
    '/api/v2019/**': {
      proxy: { to: `${process.env.CBD_API_HOST ?? 'https://api.cbd.int'}/api/v2019/**` }
    },
    '/api/v2020/**': {
      proxy: { to: `${process.env.CBD_API_HOST ?? 'https://api.cbd.int'}/api/v2020/**` }
    },
    '/api/v2021/**': {
      proxy: { to: `${process.env.CBD_API_HOST ?? 'https://api.cbd.int'}/api/v2021/**` }
    },
    '/api/v2022/**': {
      proxy: { to: `${process.env.CBD_API_HOST ?? 'https://api.cbd.int'}/api/v2022/**` }
    },
    '/api/v2023/**': {
      proxy: { to: `${process.env.CBD_API_HOST ?? 'https://api.cbd.int'}/api/v2023/**` }
    },
    '/api/v2024/**': {
      proxy: { to: `${process.env.CBD_API_HOST ?? 'https://api.cbd.int'}/api/v2024/**` }
    },
    '/api/v2025/**': {
      proxy: { to: `${process.env.CBD_API_HOST ?? 'https://api.cbd.int'}/api/v2025/**` }
    },
    // All other /api/* — proxied to API_HOST (defaults to dev/staging)
    '/api/**': { proxy: { to: `${process.env.API_HOST ?? 'https://api.cbddev.xyz'}/**` } },
    // Translation API — proxied to the local Express server
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
