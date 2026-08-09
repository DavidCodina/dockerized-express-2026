// Make sure to do: npx prisma generate for this to work.
import { PrismaClient } from '@/generated/prisma/client'
// https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction#importing-prisma-client
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

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
