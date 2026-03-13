import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type AppTheme = 'vibrant' | 'dark'

type ThemeContextValue = {
  theme: AppTheme
  toggleTheme: () => void
  setTheme: (theme: AppTheme) => void
}

const THEME_STORAGE_KEY = 'fittrack-theme'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getStoredTheme(): AppTheme {
  if (typeof window === 'undefined') {
    return 'vibrant'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'dark') {
    return 'dark'
  }

  if (storedTheme === 'monochrome') {
    return 'dark'
  }

  return 'vibrant'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(getStoredTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  function setTheme(nextTheme: AppTheme) {
    setThemeState(nextTheme)
  }

  function toggleTheme() {
    setThemeState((currentTheme) => (currentTheme === 'vibrant' ? 'dark' : 'vibrant'))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return context
}
