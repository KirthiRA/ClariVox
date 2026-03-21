import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('clarivox_theme') || 'dark')

  const toggleTheme = (t) => {
    setTheme(t)
    localStorage.setItem('clarivox_theme', t)
  }

  const isDark = theme === 'dark'

  const colors = {
    // Backgrounds
    pageBg:      isDark ? '#08090f'                    : '#f0f4ff',
    sidebarBg:   isDark ? '#0c0e1a'                    : '#ffffff',
    cardBg:      isDark ? '#0f1117'                    : '#ffffff',
    headerBg:    isDark ? 'rgba(8,9,15,0.97)'          : 'rgba(255,255,255,0.97)',
    inputBg:     isDark ? 'rgba(91,141,238,0.06)'      : 'rgba(91,141,238,0.07)',
    rowHover:    isDark ? 'rgba(91,141,238,0.07)'      : 'rgba(91,141,238,0.05)',
    // Text
    textPrimary:   isDark ? '#e2e8f0'                  : '#0f172a',
    textSecondary: isDark ? '#6a7a9a'                  : '#475569',
    textMuted:     isDark ? '#3d4a6b'                  : '#94a3b8',
    // Borders
    border:      isDark ? 'rgba(91,141,238,0.12)'      : 'rgba(91,141,238,0.2)',
    borderInput: isDark ? 'rgba(91,141,238,0.18)'      : 'rgba(91,141,238,0.3)',
    // Special
    tableHead:   isDark ? '#13151f'                    : '#f8faff',
    scrollThumb: isDark ? '#1e2a4a'                    : '#cbd5f0',
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)