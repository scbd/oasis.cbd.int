export interface TemporaryFile {
  url: string
  hash: string
  uid: string
  contentType: string
  size: number
}

export class FilesApi {
  async uploadTemporaryFile(file: File): Promise<TemporaryFile> {
    const body = new FormData()
    body.append('file', file)
    return $fetch<TemporaryFile>('/api/v2015/temporary-files', { method: 'POST', body })
  }
}
