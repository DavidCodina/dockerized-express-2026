import { Request, Response /*, NextFunction */ } from 'express'
import prisma from '@/prisma'

/* ====================== 
      getPosts() 
====================== */

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    /* ======================
        Existence Check
    ====================== */

    if (!posts) {
      return res.status(404).json({
        data: null,
        message: 'Resource not found.',
        success: false
      })
    }

    /* ======================
            Response
    ====================== */

    return res.status(200).json({
      data: posts,
      message: 'success',
      success: true
    })
  } catch (err) {
    // if (err instanceof Error) { console.log({ name: err.name, message: err.message }) }
    return res.status(500).json({
      data: null,
      message: err instanceof Error ? err.message : 'Server error.',
      success: false
    })
  }
}

/* ====================== 
      createPost()
====================== */

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, body } = req.body

    /* ======================
            Validation
    ====================== */

    if (!title || !body) {
      return res.status(400).json({
        data: null,
        message: 'Missing required fields: title and body.',
        success: false
      })
    }

    /* ======================
          Create Post
    ====================== */

    const newPost = await prisma.post.create({
      data: {
        title,
        body
      }
    })

    /* ======================
            Response
    ====================== */

    return res.status(201).json({
      data: newPost,
      message: 'Post created successfully.',
      success: true
    })
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        data: null,
        message: 'A post with that title already exists.',
        success: false
      })
    }

    return res.status(500).json({
      data: null,
      message: 'Server error.',
      success: false
    })
  }
}
