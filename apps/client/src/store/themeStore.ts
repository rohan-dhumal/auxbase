import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: 'light',
            toggleTheme: () => {
                const next = get().theme === 'light' ? 'dark' : 'light'
                document.documentElement.classList.remove('light', 'dark')
                document.documentElement.classList.add(next)
                set({ theme: next })
            },
            setTheme: (theme) => {
                document.documentElement.classList.remove('light', 'dark')
                document.documentElement.classList.add(theme)
                set({ theme })
            },
        }),
        {
            name: 'auxbase-theme',
        }
    )
)