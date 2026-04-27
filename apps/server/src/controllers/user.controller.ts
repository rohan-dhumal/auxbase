import type { Response } from 'express'
import type { AuthRequest } from '../middleware/authenticate'
import type { Role } from '../middleware/authorize'
import {
    listUsers,
    getUserById,
    updateUser,
    deactivateUser,
    activateUser,
    changePassword,
} from '../services/user.service'

export const getUsers = async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const search = req.query.search as string | undefined
    const role = req.query.role as Role | undefined
    const status = req.query.status as 'ACTIVE' | 'INACTIVE' | undefined

    const result = await listUsers(page, limit, search, role, status)
    res.json(result)
}

export const getUser = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    if (!id) {
        res.status(400).json({ message: 'User ID is required' })
        return
    }

    const user = await getUserById(id)
    res.json({ user })
}

export const editUser = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    if (!id) {
        res.status(400).json({ message: 'User ID is required' })
        return
    }

    const { name, role } = req.body

    if (!name && !role) {
        res.status(400).json({ message: 'Provide at least one field to update' })
        return
    }

    const user = await updateUser(id, { name, role })
    res.json({ message: 'User updated successfully', user })
}

export const deactivate = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    if (!id) {
        res.status(400).json({ message: 'User ID is required' })
        return
    }

    if (req.user?.userId === id) {
        res.status(400).json({ message: 'You cannot deactivate your own account' })
        return
    }

    const user = await deactivateUser(id)
    res.json({ message: 'User deactivated successfully', user })
}

export const activate = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    if (!id) {
        res.status(400).json({ message: 'User ID is required' })
        return
    }

    if (req.user?.userId === id) {
        res.status(400).json({ message: 'You cannot activate your own account' })
        return
    }

    const user = await activateUser(id)
    res.json({ message: 'User activated successfully', user })
}

export const updatePassword = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
        res.status(400).json({ message: 'Both current and new password are required' })
        return
    }

    if (req.user?.userId !== id) {
        res.status(403).json({ message: 'You can only change your own password' })
        return
    }

    await changePassword(id, currentPassword, newPassword)
    res.json({ message: 'Password changed successfully' })
}