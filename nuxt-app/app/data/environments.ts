export interface Environment {
  key: string
  title: string
}

export const environments: Environment[] = [
  { key: 'production', title: 'Production Environment' },
  { key: 'training', title: 'Training Environment' },
  { key: 'development', title: 'Development Environment' }
]

export function getEnvironments(isProduction: boolean): Environment[] {
  return environments.filter((e) =>
    isProduction ? e.key !== 'development' : e.key === 'development'
  )
}
