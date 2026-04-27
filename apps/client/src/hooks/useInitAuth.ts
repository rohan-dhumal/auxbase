import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { refreshAuthSession } from '@/lib/api'

export const useInitAuth = () => {
    const { setAuth, clearAuth } = useAuthStore()
    const [isInitializing, setIsInitializing] = useState(true)

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { accessToken, user } = await refreshAuthSession()

                if (accessToken && user) {
                    setAuth(user, accessToken)
                } else {
                    clearAuth()
                }
            } catch {
                clearAuth()
            } finally {
                setIsInitializing(false)
            }
        }

        initAuth()
    }, [clearAuth, setAuth])

    return { isInitializing }
}
