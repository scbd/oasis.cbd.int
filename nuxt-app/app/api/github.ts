export interface GithubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  pushed_at: string
  updated_at: string
  topics: string[]
  private: boolean
  archived: boolean
  fork: boolean
}

export interface GithubOrg {
  login: string
  name: string
  description: string | null
  public_repos: number
  avatar_url: string
  html_url: string
}

export class GithubApi {
  async getOrg(org: string): Promise<GithubOrg> {
    return $fetch<GithubOrg>(`https://api.github.com/orgs/${org}`)
  }

  async getOrgRepos(org: string, perPage = 100): Promise<GithubRepo[]> {
    return $fetch<GithubRepo[]>(`https://api.github.com/orgs/${org}/repos`, {
      params: { per_page: perPage, sort: 'updated' }
    })
  }
}
