import axios from 'axios'
import type { User } from '@/store/authStore'

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
})

let accessToken: string | null = null
let refreshPromise: Promise<AuthSession> | null = null

interface AuthSession {
    accessToken: string
    user: User
}

export const setAccessToken = (token: string | null) => {
    accessToken = token
}

export const getAccessToken = () => accessToken

export const refreshAuthSession = async () => {
    if (!refreshPromise) {
        refreshPromise = axios
            .post('/api/auth/refresh', {}, { withCredentials: true })
            .then((res) => {
                const newToken = res.data.accessToken
                setAccessToken(newToken)
                return res.data
            })
            .finally(() => {
                refreshPromise = null
            })
    }

    return refreshPromise
}

api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true

            try {
                const { accessToken: newToken } = await refreshAuthSession()
                original.headers.Authorization = `Bearer ${newToken}`
                return api(original)
            } catch {
                setAccessToken(null)
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export default api
