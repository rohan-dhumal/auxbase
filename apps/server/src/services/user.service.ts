import prisma from '../config/prisma'
import type { Role } from '../middleware/authorize'
import { comparePassword, hashPassword } from '../utils/hash'

export const listUsers = async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: Role,
    status?: 'ACTIVE' | 'INACTIVE'
) => {
    const skip = (page - 1) * limit

    const where = {
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
            ],
        }),
        ...(role && { role }),
        ...(status && { status }),
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
    ])

    return {
        users,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    }
}

export const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    })

    if (!user) {
        throw new Error('User not found')
    }

    return user
}

export const updateUser = async (
    id: string,
    data: { name?: string; role?: Role }
) => {
    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
        throw new Error('User not found')
    }

    return prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    })
}

export const deactivateUser = async (id: string) => {
    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
        throw new Error('User not found')
    }

    return prisma.user.update({
        where: { id },
        data: { status: 'INACTIVE' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            updatedAt: true,
        },
    })
}

export const activateUser = async (id: string) => {
    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
        throw new Error('User not found')
    }

    return prisma.user.update({
        where: { id },
        data: { status: 'ACTIVE' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            updatedAt: true,
        },
    })
}

export const changePassword = async (
    id: string,
    currentPassword: string,
    newPassword: string
) => {
    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) throw new Error('User not found')

    const valid = await comparePassword(currentPassword, user.password)
    if (!valid) throw new Error('Current password is incorrect')

    const hashed = await hashPassword(newPassword)

    await prisma.user.update({
        where: { id },
        data: { password: hashed },
    })
}