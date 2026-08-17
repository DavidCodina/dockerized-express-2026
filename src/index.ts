import path from 'path'
import * as dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import 'source-map-support/register.js'

import { errorHandler, notFound } from '@/middleware/errorMiddleware'
import testRoutes from './routes/testRoutes'
import postRoutes from './routes/postRoutes'

dotenv.config()
const app = express()

//! Temporary
export var myName = 'David'

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

///////////////////////////////////////////////////////////////////////////
//
// ⚠️ Note: tsc will ignore public/, and pkgroll will ignore it too, so nothing copies it into dist/ at build time.
// However, for production, static assets in Express should be served directly from the project root, not from dist/.
//
//   app/
//     dist/
//     public/
//     package.json
//     node_modueles
//     prisma/
//     prisma.config.ts
//     docker-prod-entrypoint.sh
//
//
// In order to make this happen, step 5 in Dockerfile includes this line:
//
//   COPY public ./public
//
// The ultimate result is that the index.html can now be accessed not only from /api, but also from '/', and '/index.htm'.
//
///////////////////////////////////////////////////////////////////////////

app.use('/', express.static('public'))

/* ======================
        Routes
====================== */

app.get('/api', (_req, res) => {
  const ROOT = path.join(__dirname, '..')
  const filePath = path.join(ROOT, 'public', 'index.html')
  // console.log('\nLooking for file at:', filePath)
  res.sendFile(filePath)
})

app.use('/api', testRoutes)
app.use('/api/posts', postRoutes)
app.use(notFound)
app.use(errorHandler)

/* ======================

====================== */

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server listening on port ${port}...`))
