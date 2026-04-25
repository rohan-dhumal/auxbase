import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'

export interface AuthRequest extends Request {
    user?: {
        userId: string
        email: string
        role: string
    }
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided' })
        return
    }

    const token = authHeader.split(' ')[1]

    try {
        const payload = verifyAccessToken(token)
        req.user = payload
        next()
    } catch {
        res.status(401).json({ message: 'Invalid or expired token' })
    }
}