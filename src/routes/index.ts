import { Router } from 'express'
import path from 'path'
const router = Router()

// ⚠️ Express 5 restricts regular expressions in route paths, so this pattern no longer works.
// router.get('^/$|/index(.html)?', (_req, res) => {
//   //res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
//   res.sendFile(path.join(__dirname, 'public', 'index.html'))
// })

router.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

router.get('/index', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

router.get('/index.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

export default router
