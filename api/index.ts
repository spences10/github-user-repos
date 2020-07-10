import { Repositories } from '@saber2pr/types-github-api'
import { NowRequest, NowResponse } from '@vercel/node'
import fetch from 'node-fetch'

type TResponseRepositories = {
  name: string
  description: string
  homepage: string
  repoLink: string
  stars: number
}

const GITHUB_REPOS_URL = (user: string): string =>
  `https://api.github.com/users/${user}/repos`

const getRepos = async (user?: string): Promise<Repositories> => {
  const resp = await fetch(GITHUB_REPOS_URL(user))

  return resp.json()
}

export default async (req: NowRequest, res: NowResponse) => {
  if (Array.isArray(req.query.username)) {
    return res.json({
      status: 404,
    })
  }

  const data = await getRepos(req.query.username)

  res.setHeader(`Access-Control-Allow-Origin`, `*`)
  res.setHeader(
    `Cache-Control`,
    `s-maxage=86400, stale-while-revalidate`
  )

  const repositories: TResponseRepositories[] = data
    .filter(({ fork }) => !fork)
    .map(
      ({
        name,
        description,
        homepage,
        html_url,
        stargazers_count,
      }) => ({
        name,
        description,
        homepage,
        repoLink: html_url,
        stars: stargazers_count,
      })
    )
    .sort((p1, p2) => p2.stars - p1.stars)

  res.json(repositories)
}
