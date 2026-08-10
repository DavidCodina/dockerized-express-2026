import prisma from '@/prisma'

const posts = [
  {
    title: 'Post 1',
    body: 'Bla, bla, bla...'
  },
  {
    title: 'Post 2',
    body: 'Bla, bla, bla...'
  },
  {
    title: 'Post 3',
    body: 'Bla, bla, bla...'
  }
]

/* ========================================================================

======================================================================== */

async function main() {
  // Check if posts already exist.
  const postCount = await prisma.post.count()

  if (postCount === 0) {
    console.log('\n🌱 No posts found. Seeding initial posts...')

    await prisma.post.createMany({
      data: posts
    })

    console.log(`\n🌱 Initial posts created...`)
  } else {
    console.log(`\n🌱 Database already has posts. Skipping seed.`)
  }
}

main()
  .catch((e) => {
    console.error('\n❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
