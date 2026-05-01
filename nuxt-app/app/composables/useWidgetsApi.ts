export interface WidgetParam {
  name: string
  type: 'regex' | 'jsonSchema'
  validationRegex?: string
  validationJsonSchema?: unknown
}

export interface WidgetDatasource {
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT'
  queryString?: Record<string, WidgetParam>
  formData?: Record<string, WidgetParam>
}

export interface Widget {
  _id?: string
  name: string
  contentType: string
  method: 'GET' | 'POST' | 'PUT'
  queryString?: Record<string, WidgetParam>
  formData?: Record<string, WidgetParam>
  dataSource?: WidgetDatasource[]
  template?: string
  meta?: {
    modifiedOn?: string
    modifiedBy?: number
    modifiedByInfo?: { firstName?: string; lastName?: string }
  }
}

export function useWidgetsApi() {
  async function getWidgets(): Promise<Widget[]> {
    return $fetch<Widget[]>('/api/v2020/widgets', {
      params: {
        f: JSON.stringify({
          name: 1,
          contentType: 1,
          method: 1,
          _id: 1,
          'meta.modifiedOn': 1,
          'meta.modifiedBy': 1,
          'meta.modifiedByInfo': 1
        }),
        s: JSON.stringify({ 'meta.modifiedOn': -1 })
      }
    })
  }

  async function getWidget(id: string): Promise<Widget> {
    return $fetch<Widget>(`/api/v2020/widgets/${encodeURIComponent(id)}`)
  }

  async function createWidget(data: Omit<Widget, '_id'>): Promise<{ id: string }> {
    return $fetch<{ id: string }>('/api/v2020/widgets', { method: 'POST', body: data })
  }

  async function updateWidget(id: string, data: Widget): Promise<void> {
    await $fetch(`/api/v2020/widgets/${encodeURIComponent(id)}`, { method: 'PUT', body: data })
  }

  async function deleteWidget(id: string): Promise<void> {
    await $fetch(`/api/v2020/widgets/${encodeURIComponent(id)}`, { method: 'DELETE' })
  }

  return { getWidgets, getWidget, createWidget, updateWidget, deleteWidget }
}
