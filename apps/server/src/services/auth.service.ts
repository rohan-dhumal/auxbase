import prisma from '../config/prisma'
import { hashPassword, comparePassword } from '../utils/hash'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt'
import type { RegisterInput, LoginInput } from '@auxbase/shared'

export const registerUser = async (input: RegisterInput) => {
    const existing = await prisma.user.findUnique({
        where: { email: input.email },
    })

    if (existing) {
        throw new Error('User with this email already exists')
    }

    const hashed = await hashPassword(input.password)

    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            password: hashed,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
        },
    })

    return user
}

export const loginUser = async (input: LoginInput) => {
    const user = await prisma.user.findUnique({
        where: { email: input.email },
    })

    if (!user) {
        throw new Error('Invalid email or password')
    }

    if (user.status === 'INACTIVE') {
        throw new Error('Your account has been deactivated')
    }

    const valid = await comparePassword(input.password, user.password)

    if (!valid) {
        throw new Error('Invalid email or password')
    }

    const payload = { userId: user.id, email: user.email, role: user.role }

    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await prisma.session.create({
        data: {
            userId: user.id,
            refreshToken,
            expiresAt,
        },
    })

    const { password: _, ...userWithoutPassword } = user

    return { accessToken, refreshToken, user: userWithoutPassword }
}

export const refreshTokens = async (token: string) => {
    const payload = verifyRefreshToken(token)

    const session = await prisma.session.findUnique({
        where: { refreshToken: token },
    })

    if (!session || session.expiresAt < new Date()) {
        throw new Error('Invalid or expired refresh token')
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
    })

    if (!user) {
        throw new Error('User not found')
    }

    const newPayload = { userId: user.id, email: user.email, role: user.role }
    const accessToken = generateAccessToken(newPayload)
    const refreshToken = generateRefreshToken(newPayload)

    await prisma.session.update({
        where: { refreshToken: token },
        data: {
            refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    })

    return { accessToken, refreshToken }
}

export const logoutUser = async (token: string) => {
    await prisma.session.deleteMany({
        where: { refreshToken: token },
    })
}