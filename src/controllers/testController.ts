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
// e.g., "nodeVersion": "v26.7.0",

export const nodeVersion = async (req: Request, res: Response) => {
  return res.status(200).json({
    nodeVersion: process.version,
    nodeEnv: process.env.NODE_ENV,
    test: 'Testing preview deployment...'
  })
}

/* ====================== 
      portNumber()
====================== */
// The Render port number when deployed is "10000".

export const portNumber = async (req: Request, res: Response) => {
  try {
    const portNumber = process.env.PORT

    return res.status(200).json({
      data: {
        portNumber
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

/* ====================== 
    postgresVersion()
====================== */
// This can be used to check the server version of the Render Postgres database.
// Or you can just check the version through PgAdmin. Currently, the Render Postgres
// version seems to be: 18.4 (Debian 18.4-1.pgdg12+1). The version I'm using locally
// is "18.4 (Debian 18.4-1.pgdg13+1)".

export const postgresVersion = async (req: Request, res: Response) => {
  try {
    // const result = await prisma.$queryRaw<{ version: string }[]>`SELECT version()`
    // [ { version: 'PostgreSQL 18.4 (Debian 18.4-1.pgdg13+1) on aarch64-unknown-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit'}]

    const result = await prisma.$queryRaw<{ server_version: string }[]>`SHOW server_version`
    const serverVersion = result[0]?.server_version ?? null
    const postgresVersion = serverVersion ? serverVersion.split(' ')[0] : null

    return res.status(200).json({
      data: {
        postgresVersion,
        serverVersion
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
