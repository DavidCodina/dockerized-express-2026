import path from 'path'
import * as dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import 'source-map-support/register.js'

import { errorHandler, notFound } from '@/middleware/errorMiddleware'
import indexRoute from './routes'
import testRoutes from './routes/testRoutes'
import postRoutes from './routes/postRoutes'

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

app.use('/api', indexRoute)
app.use('/api', testRoutes)
app.use('/api/posts', postRoutes)
app.use(notFound)
app.use(errorHandler)

/* ======================

====================== */

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`Server listening on port ${port}...`))
