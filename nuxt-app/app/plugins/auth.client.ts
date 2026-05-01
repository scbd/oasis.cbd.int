export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()

  await auth.loadUser()

  // Global $fetch interceptor — attaches Authorization token to all internal API calls
  globalThis.$fetch = $fetch.create({
    onRequest: async ({ request, options }) => {
      const url = typeof request === 'string' ? request : ((request as Request)?.url ?? '')

      const isTrusted =
        /^\/(api|translation-api)\//.test(url) ||
        /^https?:\/\/(api\.cbd\.int|api\.cbddev\.xyz)\//.test(url)

      if (!isTrusted) return

      const token = await auth.fetchToken()
      if (token) {
        options.headers = new Headers(options.headers)
        options.headers.set('Authorization', `Ticket ${token.token}`)
      }
    },
    onResponseError: ({ response }) => {
      if (response.status === 401) {
        auth.signOut()
      }
    }
  })
})
