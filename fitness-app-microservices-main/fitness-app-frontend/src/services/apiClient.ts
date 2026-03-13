import { env } from './env'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE'
  token?: string
  body?: unknown
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers({ 'Content-Type': 'application/json' })

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
