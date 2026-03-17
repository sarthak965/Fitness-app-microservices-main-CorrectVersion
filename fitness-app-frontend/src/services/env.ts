export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  enableMockFallback: String(import.meta.env.VITE_ENABLE_MOCK_FALLBACK ?? 'true') === 'true',
}
