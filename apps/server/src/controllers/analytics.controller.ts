import type { Response } from 'express'
import type { AuthRequest } from '../middleware/authenticate'
import {
    getKpiStats,
    getUserGrowth,
    getActivityByDay,
} from '../services/analytics.service'

export const getStats = async (req: AuthRequest, res: Response) => {
    const stats = await getKpiStats()
    res.json(stats)
}

export const getGrowth = async (req: AuthRequest, res: Response) => {
    const days = parseInt(req.query.days as string) || 30
    const data = await getUserGrowth(days)
    res.json(data)
}

export const getActivity = async (req: AuthRequest, res: Response) => {
    const days = parseInt(req.query.days as string) || 7
    const data = await getActivityByDay(days)
    res.json(data)
}