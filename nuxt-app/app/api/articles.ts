export interface Article {
  _id: string
  title: Record<string, string>
  content?: Record<string, string>
  summary?: Record<string, string>
  tags?: string[]
  customTags?: string[]
  adminTags?: string[]
  coverImage?: { url?: string; position?: string; size?: string }
  customProperties?: Record<string, unknown>
  status?: string
  meta?: {
    modifiedOn?: string
    modifiedBy?: number
    modifiedByInfo?: { firstName?: string; lastName?: string }
    createdOn?: string
    createdBy?: number
  }
}

export interface ArticleTag {
  _id: string
  title: Record<string, string>
}

export class ArticlesApi {
  async getArticles(params?: Record<string, unknown>): Promise<Article[]> {
    const query = params ?? {
      pageNumber: 0,
      pageLength: 25,
      sort: { 'meta.modifiedOn': -1 },
      fields: {
        _id: 1,
        'title.en': 1,
        'meta.modifiedOn': 1,
        'meta.modifiedBy': 1,
        'meta.modifiedByInfo': 1
      }
    }
    return $fetch<Article[]>('/api/v2017/articles', {
      params: { q: JSON.stringify(query) }
    })
  }

  async countArticles(filter?: Record<string, unknown>): Promise<number> {
    const query = { ag: [{ $count: 'count' }, ...(filter ? [{ $match: filter }] : [])] }
    const result = await $fetch<Array<{ count?: number }>>('/api/v2017/articles', {
      params: { q: JSON.stringify(query) }
    })
    return result[0]?.count ?? 0
  }

  async getArticle(id: string): Promise<Article> {
    return $fetch<Article>(`/api/v2017/articles/${id}`)
  }

  async createArticle(data: Partial<Article>): Promise<{ id: string }> {
    return $fetch<{ id: string }>('/api/v2017/articles', { method: 'POST', body: data })
  }

  async updateArticle(id: string, data: Partial<Article>): Promise<void> {
    await $fetch(`/api/v2017/articles/${id}`, { method: 'PUT', body: data })
  }

  async deleteArticle(id: string): Promise<void> {
    await $fetch(`/api/v2017/articles/${id}`, { method: 'DELETE' })
  }

  async searchTags(schema: string, query: string): Promise<ArticleTag[]> {
    const q = {
      query: { 'title.en': { $$startsWith: query } },
      pageNumber: 0,
      pageLength: 100,
      fields: { _id: 1, 'title.en': 1 }
    }
    return $fetch<ArticleTag[]>(`/api/v2017/${schema}`, {
      params: { q: JSON.stringify(q) }
    })
  }
}
