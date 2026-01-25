import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Очищаем существующие записи
  await prisma.note.deleteMany()

  // Создаем тестовые записи
  await prisma.note.createMany({
    data: [
      {
        title: 'Первая заметка',
      },
      {
        title: 'Вторая заметка',
      },
      {
        title: 'Третья заметка',
      },
    ],
  })

  console.log('✅ Seed выполнено успешно!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при выполнении seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
