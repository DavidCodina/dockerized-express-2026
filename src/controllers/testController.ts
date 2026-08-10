import { Request, Response } from 'express'
import prisma from '@/prisma'

/* ====================== 
      healthCheck()
====================== */

export const healthCheck = async (req: Request, res: Response) => {
  const time = new Date().toLocaleTimeString('en-US', {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  })

  const test = process.env.TEST || 'TEST variable not found.'

  return res.status(200).json({
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
}

/* ====================== 
      nodeVersion()
====================== */

export const nodeVersion = async (req: Request, res: Response) => {
  return res.status(200).json({
    nodeVersion: process.version,
    nodeEnv: process.env.NODE_ENV,
    test: 'Testing 54321...'
  })
}

/* ====================== 
    postgresVersion()
====================== */

export const postgresVersion = async (req: Request, res: Response) => {
  try {
    // Get Postgres version using prisma - proabably a raw query.
    const result = await prisma.$queryRaw<{ version: string }[]>`SELECT version()`

    console.log('result: ', result)

    return res.status(200).json({
      data: {
        postgresVestion: result[0]?.version ?? null
      },
      message: 'success',
      success: true
    })
  } catch (_err) {
    return res.status(500).json({
      data: null,
      message: 'Server error.',
      success: false
    })
  }
}
