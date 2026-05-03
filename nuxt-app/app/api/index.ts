import { ArticlesApi } from './articles'
import { ClearingHouseApi } from './clearing-house'
import { FilesApi } from './files'
import { GithubApi } from './github'
import { TranslationApi } from './translation'
import { WidgetsApi } from './widgets'

export const articlesApi = new ArticlesApi()
export const clearingHouseApi = new ClearingHouseApi()
export const filesApi = new FilesApi()
export const githubApi = new GithubApi()
export const translationApi = new TranslationApi()
export const widgetsApi = new WidgetsApi()

export type { Article, ArticleTag } from './articles'
export type { ClearingHouseApi as ClearingHouseApiType } from './clearing-house'
export type {
  RealmConfig,
  RealmSchema,
  Country,
  KMDocument,
  UserRole,
  SolrResponse
} from './clearing-house'
export type { Widget, WidgetParam, WidgetDatasource } from './widgets'
export type { TranslationProject } from './translation'
export type { TemporaryFile } from './files'
export type { GithubRepo, GithubOrg } from './github'
