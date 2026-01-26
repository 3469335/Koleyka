import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начало заполнения базы данных тестовыми данными...\n')

  // Очищаем существующие записи (в правильном порядке из-за внешних ключей)
  console.log('🗑️  Очистка существующих данных...')
  await prisma.zapis.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()
  console.log('✅ Данные очищены\n')

  // Создаем категории пользователей
  console.log('📋 Создание категорий пользователей...')
  const category1 = await prisma.category.create({
    data: { category: 'User1' },
  })
  const category2 = await prisma.category.create({
    data: { category: 'User2' },
  })
  const category3 = await prisma.category.create({
    data: { category: 'User3' },
  })
  const category4 = await prisma.category.create({
    data: { category: 'User4' },
  })
  console.log('✅ Создано 4 категории\n')

  // Создаем пользователей
  console.log('👥 Создание пользователей...')
  const user1 = await prisma.user.create({
    data: {
      name: 'Иван Иванов',
      userTypeId: category1.id, // User1 - владелец
    },
  })
  const user2 = await prisma.user.create({
    data: {
      name: 'Петр Петров',
      userTypeId: category2.id, // User2 - куратор
    },
  })
  const user3 = await prisma.user.create({
    data: {
      name: 'Сергей Сергеев',
      userTypeId: category3.id, // User3 - контролёр
    },
  })
  const user4 = await prisma.user.create({
    data: {
      name: 'Алексей Алексеев',
      userTypeId: category4.id, // User4 - водитель
    },
  })
  const user5 = await prisma.user.create({
    data: {
      name: 'Мария Смирнова',
      userTypeId: category3.id, // User3 - контролёр
    },
  })
  console.log('✅ Создано 5 пользователей\n')

  // Создаем записи очереди
  console.log('🚗 Создание записей очереди...')
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)

  await prisma.zapis.createMany({
    data: [
      {
        number: 1,
        name: 'А123БВ777',
        trans: 'Грузовик',
        srokDost: tomorrow,
        datObr: now,
        timObr: '09:00',
        datRazm: tomorrow,
        timRazm: '10:00',
        telephon: '+7 (999) 123-45-67',
        zvonok: 'едет',
      },
      {
        number: 2,
        name: 'В456ГД123',
        trans: 'Легковой',
        srokDost: nextWeek,
        datObr: now,
        timObr: '10:30',
        telephon: '+7 (999) 234-56-78',
        zvonok: 'звонить утром',
      },
      {
        number: 3,
        name: 'С789ЕЖ456',
        trans: 'Фургон',
        srokDost: tomorrow,
        datObr: now,
        timObr: '11:00',
        datRazm: tomorrow,
        timRazm: '12:00',
        telephon: '+7 (999) 345-67-89',
        zvonok: ' ',
      },
      {
        number: 4,
        name: 'Д012ЗИ789',
        trans: 'Грузовик',
        srokDost: nextWeek,
        telephon: '+7 (999) 456-78-90',
        zvonok: 'недозвон 1',
      },
      {
        number: 5,
        name: 'Е345КЛ012',
        trans: 'Легковой',
        srokDost: tomorrow,
        datObr: now,
        timObr: '14:00',
        telephon: '+7 (999) 567-89-01',
        zvonok: 'ремонт',
      },
    ],
  })
  console.log('✅ Создано 5 записей очереди\n')

  // Выводим статистику
  const categoryCount = await prisma.category.count()
  const userCount = await prisma.user.count()
  const zapisCount = await prisma.zapis.count()

  console.log('📊 Статистика:')
  console.log(`   - Категорий: ${categoryCount}`)
  console.log(`   - Пользователей: ${userCount}`)
  console.log(`   - Записей очереди: ${zapisCount}`)
  console.log('\n✅ Seed выполнено успешно!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при выполнении seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
