import { PrismaClient } from '@prisma/client'

// Получаем Prisma Client для выбранной БД
export function getPrismaClient(dbType: 'local' | 'production'): PrismaClient {
  // Для production используем стандартный клиент
  if (dbType === 'production') {
    const { prisma } = require('./prisma')
    return prisma
  }

  // Для local создаем новый клиент с локальным DATABASE_URL
  // Если нужна локальная БД, можно использовать DATABASE_URL_LOCAL из env
  const localDbUrl = process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL
  
  return new PrismaClient({
    datasources: {
      db: {
        url: localDbUrl,
      },
    },
  })
}
