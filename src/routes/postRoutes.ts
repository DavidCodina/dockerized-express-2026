import { Router } from 'express'
import { getPosts, createPost } from '@/controllers/postController'

const router = Router()

router.route('/').get(getPosts).post(createPost)
// router.get('/:id', getPost)
// router.delete('/:id', deletePost)
// router.patch('/:id', updatePost)

export default router
