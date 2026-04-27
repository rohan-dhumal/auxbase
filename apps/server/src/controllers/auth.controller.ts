import type { Request, Response } from 'express'
import { registerSchema, loginSchema } from '@auxbase/shared'
import {
    registerUser,
    loginUser,
    refreshTokens,
    logoutUser,
} from '../services/auth.service'

const REFRESH_TOKEN_COOKIE = 'refreshToken'

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

export const register = async (req: Request, res: Response) => {
    const result = registerSchema.safeParse(req.body)

    if (!result.success) {
        res.status(400).json({ message: result.error.issues[0].message })
        return
    }

    const user = await registerUser(result.data)
    res.status(201).json({ message: 'Registration successful', user })
}

export const login = async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body)

    if (!result.success) {
        res.status(400).json({ message: result.error.issues[0].message })
        return
    }

    const { accessToken, refreshToken, user } = await loginUser(result.data)

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions)
    res.json({ accessToken, user })
}

export const refresh = async (req: Request, res: Response) => {
    const token = req.cookies[REFRESH_TOKEN_COOKIE]

    if (!token) {
        res.status(401).json({ message: 'No refresh token provided' })
        return
    }

    try {
        const { accessToken, refreshToken, user } = await refreshTokens(token)

        res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions)
        res.json({ accessToken, user })
    } catch {
        res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions)
        res.status(401).json({ message: 'Invalid or expired refresh token' })
    }
}

export const logout = async (req: Request, res: Response) => {
    const token = req.cookies[REFRESH_TOKEN_COOKIE]

    if (token) {
        await logoutUser(token)
    }

    res.clearCookie(REFRESH_TOKEN_COOKIE)
    res.json({ message: 'Logged out successfully' })
}
