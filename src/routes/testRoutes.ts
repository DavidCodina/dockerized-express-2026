import { Router } from 'express'
import { healthCheck, nodeVersion, portNumber, postgresVersion } from '@/controllers/testController'

const router = Router()

router.get('/health-check', healthCheck)
router.get('/node-version', nodeVersion)
router.get('/port-number', portNumber)
router.get('/postgres-version', postgresVersion)

export default router
