import { defineStore } from 'pinia'
import type { AuthToken, AuthUser } from '~/types/auth'

const ANONYMOUS_USER: AuthUser = {
  userID: 1,
  name: 'anonymous',
  email: 'anonymous@domain',
  government: null,
  userGroups: null,
  isAuthenticated: false,
  isOffline: true,
  roles: []
}

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()
  const accountsUrl = config.public.accountsUrl as string

  const user = ref<AuthUser>(ANONYMOUS_USER)
  const token = ref<AuthToken | null>(null)

  // Resolved once the iframe handshake completes
  let iframeReady: Promise<Window> | null = null

  const isAuthenticated = computed(() => user.value.isAuthenticated)

  const initials = computed(() => {
    if (!user.value.name || !isAuthenticated.value) return '?'
    return user.value.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  })

  // ----------------------------------------------------------------
  // iframe-based token retrieval (mirrors AngularJS apiToken service)
  // ----------------------------------------------------------------
  function getIframeWindow(): Promise<Window> {
    if (iframeReady) return iframeReady

    iframeReady = new Promise<Window>((resolve, reject) => {
      const frame = document.createElement('iframe')
      frame.src = `${accountsUrl}/app/authorize.html`
      frame.style.display = 'none'
      document.body.prepend(frame)

      let loaded = false
      frame.addEventListener('load', () => {
        loaded = true
        resolve(frame.contentWindow!)
      })

      setTimeout(() => {
        if (!loaded) reject(new Error('Accounts iframe timed out'))
      }, 5000)
    })

    return iframeReady
  }

  async function fetchToken(): Promise<AuthToken | null> {
    if (token.value) {
      if (isTokenExpired(token.value)) {
        token.value = null
      } else {
        return token.value
      }
    }

    try {
      const iframeWindow = await getIframeWindow()

      return await new Promise<AuthToken | null>((resolve) => {
        const timeout = setTimeout(() => resolve(null), 1000)

        function onMessage(event: MessageEvent) {
          if (event.origin !== accountsUrl) return
          clearTimeout(timeout)
          window.removeEventListener('message', onMessage)

          const msg = JSON.parse(event.data)
          if (msg.type === 'authenticationToken') {
            token.value = { token: msg.authenticationToken, expiration: msg.expiration }
            resolve(token.value)
          } else {
            resolve(null)
          }
        }

        window.addEventListener('message', onMessage)
        iframeWindow.postMessage(JSON.stringify({ type: 'getAuthenticationToken' }), accountsUrl)
      })
    } catch {
      return null
    }
  }

  async function setToken(value: string | null, email?: string, expiration?: string) {
    try {
      const iframeWindow = await getIframeWindow()
      token.value = value ? { token: value, expiration: expiration ?? '' } : null

      iframeWindow.postMessage(
        JSON.stringify({
          type: 'setAuthenticationToken',
          authenticationToken: value,
          authenticationEmail: email,
          expiration
        }),
        accountsUrl
      )
    } catch (e) {
      console.error('Failed to set token in accounts iframe', e)
    }
  }

  function isTokenExpired(t: AuthToken): boolean {
    if (!t.expiration) return false
    return new Date(t.expiration).getTime() < Date.now()
  }

  // ----------------------------------------------------------------
  // User
  // ----------------------------------------------------------------
  async function loadUser(): Promise<AuthUser> {
    const apiToken = await fetchToken()

    if (!apiToken) {
      user.value = ANONYMOUS_USER
      return ANONYMOUS_USER
    }

    try {
      const data = await $fetch<AuthUser>('/api/v2013/authentication/user', {
        headers: { Authorization: `Ticket ${apiToken.token}` }
      })
      user.value = data
      return data
    } catch {
      user.value = ANONYMOUS_USER
      return ANONYMOUS_USER
    }
  }

  async function signIn(email: string, password: string): Promise<AuthUser> {
    const tokenData = await $fetch<{ authenticationToken: string; expiration: string }>(
      '/api/v2013/authentication/token',
      { method: 'POST', body: { email, password } }
    )

    const userData = await $fetch<AuthUser>('/api/v2013/authentication/user', {
      headers: { Authorization: `Ticket ${tokenData.authenticationToken}` }
    })

    await setToken(tokenData.authenticationToken, email.toLowerCase(), tokenData.expiration)
    user.value = userData
    return userData
  }

  async function signOut(): Promise<void> {
    await setToken(null)
    user.value = ANONYMOUS_USER
  }

  function isInRole(...roles: string[]): boolean {
    if (!user.value?.roles?.length) return false
    return roles.some((r) => user.value.roles.includes(r))
  }

  return {
    user,
    token,
    isAuthenticated,
    initials,
    fetchToken,
    loadUser,
    signIn,
    signOut,
    isInRole
  }
})
