export interface RealmSchema {
  title: { en: string; [key: string]: string }
  titlePlural?: { en: string; [key: string]: string }
  type: string
  shortCode?: string
  disableAdd?: boolean
  publishingAuthorities?: string[]
  nationalAuthorizedUser?: string[]
}

export interface RealmConfig {
  id?: string
  realm: string
  displayName: string
  environment: string
  hosts: string[]
  baseURL: string
  uIdPrefix?: string
  email?: string
  protocol?: string
  roles: { administrator?: string[]; [key: string]: string[] | undefined }
  adminRoles?: string[]
  nfpRoles?: string[]
  schemas: Record<string, RealmSchema>
  pdf?: Record<
    string,
    {
      fileName?: string
      path?: string
      s3?: { bucket: string; folder: string }
      usePrincePdf?: boolean
    }
  >
  externalNotification?: Record<string, string[]>
  notificationTemplateFolder?: string
  envMsg?: string
  isAdmin?: boolean
}

export interface Country {
  code: string
  name: { en: string; [key: string]: string }
  displayTitle?: string
}

export interface KMDocument {
  identifier: string
  realm: string
  type: string
  title: Record<string, string>
  summary?: Record<string, string>
  owner?: string
  metadata: { government?: string; schema?: string }
  createdOn?: string
  createdBy?: { userID: number; firstName: string; lastName: string }
  submittedOn?: string
  submittedBy?: { userID: number; firstName: string; lastName: string }
  updatedOn?: string
  updatedBy?: { userID: number; firstName: string; lastName: string }
  documentID?: number
  workingDocumentLock?: {
    lockID: string
    lockedOn?: string
    lockedBy?: { firstName: string; lastName: string; email: string }
  }
  failureProcessed?: { processedOn?: string; processedBy?: string; action?: string }
  validationErrors?: Array<{ code: string; property: string }>
  deletedBy?: { firstName: string; lastName: string }
  deletedOn?: string
  revision?: number
  showJson?: boolean
  showActivities?: boolean
  loading?: boolean
  isIndexed?: boolean
  index?: boolean
}

export interface UserRole {
  code: string
  name: string
  roleId: string
}

export function useClearingHouseApi() {
  const auth = useAuthStore()

  async function headers() {
    const t = await auth.fetchToken()
    return t ? { Authorization: `Ticket ${t.token}` } : {}
  }

  async function queryRealmConfigurations(): Promise<RealmConfig[]> {
    return $fetch<RealmConfig[]>('/api/v2018/realm-configurations', { headers: await headers() })
  }

  async function getRealmConfigurationByHost(host: string): Promise<RealmConfig | undefined> {
    const result = await $fetch<RealmConfig[]>(
      `/api/v2018/realm-configurations/${encodeURIComponent(host)}`,
      {
        headers: await headers()
      }
    )
    return result?.[0]
  }

  async function queryCountries(): Promise<Country[]> {
    return $fetch<Country[]>('/api/v2013/countries', { headers: await headers() })
  }

  async function queryDocuments(
    params: Record<string, unknown>,
    realmHeaders: { realm: string }
  ): Promise<{ Items: KMDocument[]; Count: number }> {
    return $fetch('/api/v2013/documents', {
      headers: { ...(await headers()), ...realmHeaders },
      query: params
    })
  }

  async function getDocumentById(id: string | number): Promise<KMDocument | undefined> {
    return $fetch<KMDocument>(`/api/v2013/documents/${encodeURIComponent(String(id))}/info`, {
      headers: await headers()
    }).catch(() => undefined)
  }

  async function getDocumentDraftById(id: string | number): Promise<KMDocument | undefined> {
    return $fetch<KMDocument>(
      `/api/v2013/documents/${encodeURIComponent(String(id))}/versions/draft/info`,
      {
        headers: await headers()
      }
    ).catch(() => undefined)
  }

  async function getDocumentRevisions(
    id: string | number
  ): Promise<{ Items: KMDocument[]; Count: number } | undefined> {
    return $fetch(`/api/v2013/documents/${encodeURIComponent(String(id))}/versions`, {
      headers: await headers()
    }).catch(() => undefined)
  }

  async function reIndexDocument(
    schema: string,
    identifier: string,
    realm: string
  ): Promise<{ status: number }> {
    return $fetch(
      `/api/v2022/documents/admin/schemas/${encodeURIComponent(schema)}/${encodeURIComponent(identifier)}/index-document`,
      {
        method: 'PUT',
        headers: await headers(),
        query: { realm }
      }
    )
  }

  async function querySolr(params: {
    query: string
    fields?: string
    rowsPerPage?: number
    start?: number
  }): Promise<{ response: { numFound: number; docs: Record<string, unknown>[] } }> {
    return $fetch('/api/v2013/index/select', {
      method: 'POST',
      headers: await headers(),
      body: {
        q: params.query,
        fl: params.fields,
        rows: params.rowsPerPage ?? 25,
        start: params.start ?? 0,
        wt: 'json'
      }
    })
  }

  async function getWorkflowHistory(
    params: Record<string, unknown>
  ): Promise<KMDocument[] | undefined> {
    return $fetch('/api/v2013/workflows', {
      headers: await headers(),
      query: params
    }).catch(() => undefined)
  }

  async function startNewWorkflow(workflowId: string, realm: string): Promise<unknown> {
    return $fetch(`/api/v2013/workflows/failed-workflows/${workflowId}/new-workflow`, {
      method: 'PUT',
      headers: await headers(),
      query: { realm }
    })
  }

  async function releaseWorkflow(workflowId: string, realm: string): Promise<void> {
    await $fetch(`/api/v2013/workflows/failed-workflows/${workflowId}/release-workflow`, {
      method: 'PUT',
      headers: await headers(),
      query: { realm }
    })
  }

  async function getUserRoleNames(roleCodes: string[]): Promise<UserRole[]> {
    return $fetch('/api/v2013/roles', {
      headers: await headers(),
      query: { q: JSON.stringify({ roles: roleCodes.map(encodeURIComponent) }) }
    })
  }

  return {
    queryRealmConfigurations,
    getRealmConfigurationByHost,
    queryCountries,
    queryDocuments,
    getDocumentById,
    getDocumentDraftById,
    getDocumentRevisions,
    reIndexDocument,
    querySolr,
    getWorkflowHistory,
    startNewWorkflow,
    releaseWorkflow,
    getUserRoleNames
  }
}
