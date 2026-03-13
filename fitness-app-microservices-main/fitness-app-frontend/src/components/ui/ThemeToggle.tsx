import { useTheme } from '../../context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button className="theme-toggle" onClick={toggleTheme} type="button" aria-label="Toggle UI theme">
      <span className="theme-toggle__label">
        <span className={`theme-toggle__option ${!isDark ? 'is-active' : ''}`}>Vibrant</span>
        <span className={`theme-toggle__option ${isDark ? 'is-active' : ''}`}>Dark</span>
      </span>
      <span className={`theme-toggle__thumb ${isDark ? 'is-dark' : ''}`} />
    </button>
  )
}
