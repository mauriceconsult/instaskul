// prisma/prisma.config.ts
export default {
  datasources: {
    db: {
      url: {
        fromEnvVar: 'DATABASE_URL',
      },
    },
  },
  migrate: {
    datasources: {
      db: {
        url: {
          fromEnvVar: 'DIRECT_URL',
        },
      },
    },
  },
}