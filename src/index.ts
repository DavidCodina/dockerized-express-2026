import path from 'path'
import * as dotenv from 'dotenv'
import express, { Request, Response /*, NextFunction */ } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import morgan from 'morgan'
import 'source-map-support/register.js'

import { errorHandler, notFound } from '@/middleware/errorMiddleware'
import indexRoute from './routes'

import prisma from '@/prisma'

dotenv.config()
const app = express()

/* ======================
    Global Middleware
====================== */

app.use(morgan('dev'))

// const allowOrigins: string[] = [
//   // 'http://localhost:3000',
//   // '...'
// ]

// Done in video: https://www.youtube.com/watch?v=JR9BeI7FY3M&list=PL0Zuz27SZ-6P4dQUsoDatjEGpmBpcOW8V&index=3 at 21:00
// const corsOptions = {
//   origin: (origin: any, callback: any) => {
//     // This should allow all origins during development.
//     // This way, we can test Postman calls.
//     // An alternative syntax would be: if (!origin) { callback(null, true) }
//     if (process.env.NODE_ENV === 'development') {
//       // The first arg is the error object.
//       // The second arg is the allowed boolean.
//       callback(null, true)
//       // This else if is saying if the origin URL is in the
//       // list of allowedOrigins, then allow it (i.e. callback(null, true))
//       // Note: that will also end up disallowing Postman
//     } else if (allowOrigins.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   },
//   credentials: true, // This sets the Access-Control-Allow-Credentials header
//   // methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
//   // The default may be 204, but some devices have issues with that
//   // (Smart TVs, older browsers, etc), so you might want to set it to 200 instead.
//   optionsSuccessStatus: 200
// }

app.use(cors(/* corsOptions */))
app.use(express.json({}))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use('/', express.static(path.join(__dirname, 'public')))

/* ======================
        Routes
====================== */
// Note that whenever possible the routes reflect the
// name of the collections (i.e., they are plural)

app.use('/api', indexRoute)

app.get('/api/health-check', (req, res) => {
  const time = new Date().toLocaleTimeString('en-US', {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  })

  const test = process.env.TEST || 'TEST variable not found.'

  res.status(200).json({
    code: 'OK',
    data: {
      time,
      nodeVersion: process.version,
      nodeEnv: process.env.NODE_ENV,
      test: test
    },
    message: 'success',
    success: true
  })
})

app.get('/api/node-version', (req, res) => {
  res.json({
    nodeVersion: process.version,
    nodeEnv: process.env.NODE_ENV,
    test: 'Testing 123...'
  })
})

app.get('/api/posts', async (req: Request, res: Response) => {
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
      message: 'Server error.',
      success: false
    })
  }
})

app.post('/api/posts', async (req: Request, res: Response) => {
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
    /* ======================
            Unique Error
    ====================== */

    if (err.code === 'P2002') {
      return res.status(409).json({
        data: null,
        message: 'A post with that title already exists.',
        success: false
      })
    }

    /* ======================
            Server Error
    ====================== */

    return res.status(500).json({
      data: null,
      message: 'Server error.',
      success: false
    })
  }
})

/* ======================

====================== */

app.use(notFound)
app.use(errorHandler)

/* ======================

====================== */

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server listening on port ${port}...`))
