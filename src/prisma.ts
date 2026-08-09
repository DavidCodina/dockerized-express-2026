// Make sure to do: npx prisma generate for this to work.
import { PrismaClient } from '@/generated/prisma/client'
// https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction#importing-prisma-client
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

// 👍🏻 You don't need a different adapter if you're switching to a Render for the production database.
// PrismaPg (from @prisma/adapter-pg, which wraps node-postgres) works with any standard Postgres server
// — it just connects via a connection string over the Postgres wire protocol. Render's Postgres is a regular
// managed Postgres instance, not a special dialect or serverless/edge variant like Neon.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})

// https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#prismaclient-in-long-running-applications
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query'] // Optional: useful for debugging.
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
