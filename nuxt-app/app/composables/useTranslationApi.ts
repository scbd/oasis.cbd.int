import type { TranslationProject } from '~/types/translation'

const BASE = '/api/v2025/translations'

export function useTranslationApi() {
  const auth = useAuthStore()

  async function authHeaders() {
    const t = await auth.fetchToken()
    return t ? { Authorization: `Ticket ${t.token}` } : {}
  }

  async function getProjects(params?: {
    q?: Record<string, unknown>
    length?: number
    skip?: number
    sort?: Record<string, number>
  }): Promise<TranslationProject[]> {
    const headers = await authHeaders()
    return $fetch<TranslationProject[]>(BASE, {
      headers,
      query: {
        q: JSON.stringify(params?.q),
        l: params?.length ?? 25,
        sk: params?.skip ?? 0,
        s: JSON.stringify(params?.sort ?? { 'meta.updatedOn': -1 }),
        f: JSON.stringify({})
      }
    })
  }

  async function getProject(id: string): Promise<TranslationProject> {
    const headers = await authHeaders()
    return $fetch<TranslationProject>(`${BASE}/${id}`, { headers })
  }

  async function addProject(document: TranslationProject): Promise<string> {
    const headers = await authHeaders()
    return $fetch<string>(BASE, {
      method: 'POST',
      headers,
      body: document
    })
  }

  async function updateProject(id: string, document: TranslationProject): Promise<void> {
    const headers = await authHeaders()
    await $fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers,
      body: document
    })
  }

  async function updateProjectStatus(id: string, status: string): Promise<void> {
    const headers = await authHeaders()
    await $fetch(`${BASE}/${id}/${status}`, { method: 'PUT', headers })
  }

  async function uploadTempFile(file: File): Promise<{
    url: string
    hash: string
    uid: string
    contentType: string
    size: number
  }> {
    const headers = await authHeaders()
    const body = new FormData()
    body.append('file', file)
    return $fetch('/api/v2015/temporary-files', { method: 'POST', headers, body })
  }

  return { getProjects, getProject, addProject, updateProject, updateProjectStatus, uploadTempFile }
}
