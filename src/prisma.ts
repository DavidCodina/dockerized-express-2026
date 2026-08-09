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
  ///////////////////////////////////////////////////////////////////////////
  //
  // ⚠️ Gotcha:
  //
  //   ❌ Invalid prisma.post.findMany() invocation: User was denied access on the database (not available)
  //
  // This does not happen when we deploy the production build to Render and use the internal database URL.
  // It only happens when we test the build locally and use the external database URL.
  // Render's internal database connections (service-to-service, within their private network) don't require SSL.
  // Render's Postgres requires SSL on EXTERNAL connections and rejects non-SSL attempts.
  //
  // node-postgres does not reliably infer SSL from the connection string alone.
  // Render's external Postgres connections require SSL, and use certs that
  // aren't in a public CA chain, so we disable strict verification rather
  // than supplying Render's CA bundle.
  //
  // Technically, this makes the app slightly less secure by disabling server identity verification.
  // This is really only needed if you're testing the production build locally against the production database,
  // which is probably a bad idea to begin with.
  //
  //   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  //
  // In fact, if you try to do that against a local Dockerized Postgres instance, you'll get a different error.
  //
  ///////////////////////////////////////////////////////////////////////////
})

// https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#prismaclient-in-long-running-applications
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query'] // Optional: useful for debugging.,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
