import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Проверка и создание тестовых данных...\n')

  try {
    // Проверяем существующие категории
    let categories = await prisma.category.findMany()
    
    if (categories.length === 0) {
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
      categories = [category1, category2, category3, category4]
      console.log('✅ Создано 4 категории\n')
    } else {
      console.log(`✅ Найдено ${categories.length} категорий\n`)
    }

    // Проверяем существующих пользователей
    let users = await prisma.user.findMany()
    
    if (users.length === 0) {
      console.log('👥 Создание пользователей...')
      await prisma.user.createMany({
        data: [
          {
            name: 'Иван Иванов',
            userTypeId: categories.find(c => c.category === 'User1')!.id,
          },
          {
            name: 'Петр Петров',
            userTypeId: categories.find(c => c.category === 'User2')!.id,
          },
          {
            name: 'Сергей Сергеев',
            userTypeId: categories.find(c => c.category === 'User3')!.id,
          },
          {
            name: 'Алексей Алексеев',
            userTypeId: categories.find(c => c.category === 'User4')!.id,
          },
          {
            name: 'Мария Смирнова',
            userTypeId: categories.find(c => c.category === 'User3')!.id,
          },
        ],
      })
      users = await prisma.user.findMany()
      console.log('✅ Создано 5 пользователей\n')
    } else {
      console.log(`✅ Найдено ${users.length} пользователей\n`)
    }

    // Проверяем существующие записи
    let zapis = await prisma.zapis.findMany()
    
    if (zapis.length === 0) {
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
            status: 'едет',
          },
          {
            number: 2,
            name: 'В456ГД123',
            trans: 'Легковой',
            srokDost: nextWeek,
            datObr: now,
            timObr: '10:30',
            telephon: '+7 (999) 234-56-78',
            status: 'звонить утром',
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
            status: ' ',
          },
          {
            number: 4,
            name: 'Д012ЗИ789',
            trans: 'Грузовик',
            srokDost: nextWeek,
            telephon: '+7 (999) 456-78-90',
            status: 'недозвон 1',
          },
          {
            number: 5,
            name: 'Е345КЛ012',
            trans: 'Легковой',
            srokDost: tomorrow,
            datObr: now,
            timObr: '14:00',
            telephon: '+7 (999) 567-89-01',
            status: 'ремонт',
          },
        ],
      })
      zapis = await prisma.zapis.findMany()
      console.log('✅ Создано 5 записей очереди\n')
    } else {
      console.log(`✅ Найдено ${zapis.length} записей очереди\n`)
    }

    // Выводим финальную статистику
    const categoryCount = await prisma.category.count()
    const userCount = await prisma.user.count()
    const zapisCount = await prisma.zapis.count()

    console.log('📊 Итоговая статистика:')
    console.log(`   - Категорий: ${categoryCount}`)
    console.log(`   - Пользователей: ${userCount}`)
    console.log(`   - Записей очереди: ${zapisCount}`)
    console.log('\n✅ Проверка завершена успешно!')
  } catch (error) {
    console.error('❌ Ошибка при проверке данных:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Критическая ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
