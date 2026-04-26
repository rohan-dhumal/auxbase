import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { authorize } from '../middleware/authorize'
import { getStats, getGrowth, getActivity } from '../controllers/analytics.controller'

const router = Router()

router.use(authenticate)

router.get('/stats', authorize('VIEWER'), getStats)
router.get('/growth', authorize('VIEWER'), getGrowth)
router.get('/activity', authorize('VIEWER'), getActivity)

export default router