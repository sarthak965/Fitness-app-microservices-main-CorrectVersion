import { AuthContext } from 'react-oauth2-code-pkce'
import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { AppUser } from '../types/auth'

type RawAuthContext = {
  token?: string
  tokenData?: Record<string, unknown>
  logIn: () => void
  logOut: () => void
  isAuthenticated?: boolean
}

type AppAuthContextValue = {
  token: string | null
  user: AppUser | null
  isAuthenticated: boolean
  login: () => void
  signup: () => void
  logout: () => void
}

const AppAuthContext = createContext<AppAuthContextValue | undefined>(undefined)

function mapTokenDataToUser(tokenData?: Record<string, unknown>): AppUser | null {
  if (!tokenData) {
    return null
  }

  return {
    id: String(tokenData.sub || ''),
    email: String(tokenData.email || ''),
    firstName: String(tokenData.given_name || 'Fit'),
    lastName: String(tokenData.family_name || 'User'),
  }
}

export function AppAuthProvider({ children }: { children: ReactNode }) {
  const raw = useContext(AuthContext) as RawAuthContext

  const value = useMemo<AppAuthContextValue>(
    () => ({
      token: raw?.token || null,
      user: mapTokenDataToUser(raw?.tokenData),
      isAuthenticated: Boolean(raw?.isAuthenticated || raw?.token),
      login: () => raw?.logIn?.(),
      signup: () => raw?.logIn?.(),
      logout: () => raw?.logOut?.(),
    }),
    [raw],
  )

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>
}

export function useAppAuth() {
  const context = useContext(AppAuthContext)

  if (!context) {
    throw new Error('useAppAuth must be used inside AppAuthProvider')
  }

  return context
}
