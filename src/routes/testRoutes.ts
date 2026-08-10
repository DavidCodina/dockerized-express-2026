import { Router } from 'express'
import { healthCheck, nodeVersion, postgresVersion } from '@/controllers/testController'

const router = Router()

router.get('/health-check', healthCheck)
router.get('/node-version', nodeVersion)
router.get('/postgres-version', postgresVersion)

export default router
