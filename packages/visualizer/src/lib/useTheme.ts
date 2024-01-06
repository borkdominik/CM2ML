import { useEffect, useState } from 'react'

export const themes = ['light', 'dark'] as const

export type Theme = (typeof themes)[number]

export function useTheme() {
  const body = document.getElementsByTagName('body')[0]
  const [theme, setTheme] = useState<Theme>(() =>
    body?.classList.contains('dark') ? 'dark' : 'light',
  )
  useEffect(() => {
    if (theme === 'light') {
      body?.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      body?.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'light' ? '#ffffff' : '#000000')
  }, [theme])
  return { theme, setTheme }
}
