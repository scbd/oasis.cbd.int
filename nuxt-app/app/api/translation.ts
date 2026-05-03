import type { TranslationProject } from '~/types/translation'

export type { TranslationProject }

const BASE = '/api/v2025/translations'

export class TranslationApi {
  async getProjects(params?: {
    q?: Record<string, unknown>
    length?: number
    skip?: number
    sort?: Record<string, number>
  }): Promise<TranslationProject[]> {
    return $fetch<TranslationProject[]>(BASE, {
      query: {
        q: JSON.stringify(params?.q),
        l: params?.length ?? 25,
        sk: params?.skip ?? 0,
        s: JSON.stringify(params?.sort ?? { 'meta.updatedOn': -1 }),
        f: JSON.stringify({})
      }
    })
  }

  async getProject(id: string): Promise<TranslationProject> {
    return $fetch<TranslationProject>(`${BASE}/${id}`)
  }

  async addProject(document: TranslationProject): Promise<string> {
    return $fetch<string>(BASE, { method: 'POST', body: document })
  }

  async updateProject(id: string, document: TranslationProject): Promise<void> {
    await $fetch(`${BASE}/${id}`, { method: 'PUT', body: document })
  }

  async updateProjectStatus(id: string, status: string): Promise<void> {
    await $fetch(`${BASE}/${id}/${status}`, { method: 'PUT' })
  }
}
