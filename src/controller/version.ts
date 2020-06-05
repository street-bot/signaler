export interface IVersion {
  sha: string
}

export function VersionObj(): IVersion {
  return {
    sha: process.env.GIT_SHA || 'development'
  }
}