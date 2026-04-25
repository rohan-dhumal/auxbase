import type { Response, NextFunction } from 'express'
import type { AuthRequest } from './authenticate'

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER'

const roleHierarchy: Record<Role, number> = {
    SUPER_ADMIN: 3,
    ADMIN: 2,
    VIEWER: 1,
}

export const authorize = (...roles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const userRole = req.user?.role as Role

        if (!userRole) {
            res.status(401).json({ message: 'Unauthorized' })
            return
        }

        const hasPermission = roles.some(
            (role) => roleHierarchy[userRole] >= roleHierarchy[role]
        )

        if (!hasPermission) {
            res.status(403).json({ message: 'Forbidden — insufficient permissions' })
            return
        }

        next()
    }
}