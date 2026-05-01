export interface Language {
  code: string
  title: string
}

export interface SourceFileUrl {
  contentType: string
  hash: string
  fileName: string
  folderPath: string
  size: number
  uid: string
  url: string
}

export interface TranslationProject {
  _id?: string
  name: string
  application: string
  description: string
  targetLocales: string[]
  sourceFileUrls: SourceFileUrl[]
  status?: string
  updatedOn?: string
  updatedBy?: {
    userID: number
    firstName: string
    lastName: string
  }
}

export interface FileUploadResult {
  url: string
  hash: string
  uid: string
  contentType: string
  size: number
}

export interface FileStatus {
  fileName: string
  fileType: string
  isFolder: boolean
  folderPath?: string
  files?: Array<{ id?: string; fileName: string; message?: string }>
}
