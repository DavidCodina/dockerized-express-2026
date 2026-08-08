import { Request, Response, NextFunction } from 'express'

/* ======================
      notFound()
====================== */
// Fallback for 404 errors

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Not Found: ${req.originalUrl}`)
  res.status(404)
  next(err)
}

/* ======================
      errorHandler()
====================== */

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = res.statusCode ? res.statusCode : 500

  res.status(statusCode)

  return res.json({
    data: null,
    message: err?.message,
    stack: process.env?.NODE_ENV === 'production' ? null : err?.stack,
    success: false
  })
}
