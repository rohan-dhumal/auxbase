import prisma from '../config/prisma'

export const getKpiStats = async () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [totalUsers, activeUsers, inactiveUsers, newUsersThisMonth] =
        await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { status: 'ACTIVE' } }),
            prisma.user.count({ where: { status: 'INACTIVE' } }),
            prisma.user.count({
                where: { createdAt: { gte: startOfMonth } },
            }),
        ])

    return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        newUsersThisMonth,
    }
}

export const getUserGrowth = async (days: number = 30) => {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const users = await prisma.user.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
    })

    const grouped: Record<string, number> = {}

    users.forEach((user) => {
        const date = user.createdAt.toISOString().split('T')[0]
        grouped[date] = (grouped[date] || 0) + 1
    })

    const result = []
    for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (days - 1 - i))
        const key = date.toISOString().split('T')[0]
        result.push({ date: key, count: grouped[key] || 0 })
    }

    return result
}

export const getActivityByDay = async (days: number = 7) => {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const logs = await prisma.auditLog.findMany({
        where: { timestamp: { gte: since } },
        select: { timestamp: true },
        orderBy: { timestamp: 'asc' },
    })

    const grouped: Record<string, number> = {}

    logs.forEach((log) => {
        const date = log.timestamp.toISOString().split('T')[0]
        grouped[date] = (grouped[date] || 0) + 1
    })

    const result = []
    for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (days - 1 - i))
        const key = date.toISOString().split('T')[0]
        result.push({ date: key, count: grouped[key] || 0 })
    }

    return result
}