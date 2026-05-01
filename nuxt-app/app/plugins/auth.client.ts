export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()

  // Load user on every page refresh
  await auth.loadUser()

  // Auto-attach token to all $fetch calls targeting /api/* or /translation-api/*
  const { hook } = useRequestEvent() ?? {}
  if (!hook) {
    // Client-side: use global $fetch interceptor
    globalThis.$fetch = $fetch.create({
      onRequest: async ({ options }) => {
        const url = typeof options.baseURL === 'string' ? options.baseURL : ''
        const isTrusted =
          /^\/(api|translation-api)\//.test(url) ||
          /^https?:\/\/(api\.cbd\.int|api\.cbddev\.xyz)\//.test(url)

        if (!isTrusted) return

        const token = await auth.fetchToken()
        if (token) {
          options.headers = {
            ...(options.headers ?? {}),
            Authorization: `Ticket ${token.token}`
          }
        }
      }
    })
  }
})
