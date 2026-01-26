import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { canViewZapis, canEditZapis, canCreateZapis, canDeleteZapis, canViewOnlyOwnZapis } from '@/lib/permissions'
import { shouldExcludeFromQueue } from '@/lib/queue-calculator'

export const dynamic = 'force-dynamic'

// GET - получение записей zapis
export async function GET(request: NextRequest) {
  try {
    const user = await getUserSession()
    
    if (!user || !canViewZapis(user)) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    // Для User4 показываем только свою запись
    if (canViewOnlyOwnZapis(user)) {
      const zapis = await prisma.zapis.findFirst({
        where: {
          name: user.name,
        },
      })

      if (!zapis) {
        return NextResponse.json({
          data: [],
          total: 0,
          queueCount: 0,
          pagination: {
            page: 1,
            pageSize: 1,
            total: 0,
            totalPages: 0,
          },
        })
      }

      return NextResponse.json({
        data: [zapis],
        total: 1,
        queueCount: 0,
        pagination: {
          page: 1,
          pageSize: 1,
          total: 1,
          totalPages: 1,
        },
      })
    }

    // Для остальных пользователей показываем все записи
    const skip = (page - 1) * pageSize
    const [data, total] = await Promise.all([
      prisma.zapis.findMany({
        skip,
        take: pageSize,
        orderBy: {
          number: 'asc',
        },
      }),
      prisma.zapis.count(),
    ])

    // Подсчет записей в очереди (исключая определенные статусы)
    const excludedCount = await prisma.zapis.count({
      where: {
        status: {
          in: ['недозвон 2', 'отказ', 'заехал'],
        },
      },
    })

    const queueCount = total - excludedCount

    return NextResponse.json({
      data,
      total,
      queueCount,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error: any) {
    console.error('Ошибка при получении записей zapis:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении записей', message: error.message },
      { status: 500 }
    )
  }
}

// POST - создание новой записи
export async function POST(request: NextRequest) {
  try {
    const user = await getUserSession()
    
    if (!user || !canCreateZapis(user)) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const body = await request.json()
    const { number, name, trans, srokDost, datObr, timObr, datRazm, timRazm, telephon, status } = body

    // Валидация обязательных полей
    if (!number || !name || !trans) {
      return NextResponse.json(
        { error: 'Необходимо заполнить поля: number, name, trans' },
        { status: 400 }
      )
    }

    // Автоматически устанавливаем дату и время обращения, если не указаны
    const now = new Date()
    const currentDate = datObr ? new Date(datObr) : now
    const currentTime = timObr || now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

    // Создаем запись zapis
    const zapis = await prisma.zapis.create({
      data: {
        number: parseInt(number),
        name: name.trim(),
        trans: trans.trim(),
        srokDost: srokDost ? new Date(srokDost) : null,
        datObr: currentDate,
        timObr: currentTime,
        datRazm: datRazm ? new Date(datRazm) : null,
        timRazm: timRazm || null,
        telephon: telephon || null,
        status: status || ' ',
      },
    })

    // Если поле name заполнено, создаем User4 если его еще нет
    if (name && name.trim()) {
      const existingUser = await prisma.user.findFirst({
        where: {
          name: name.trim(),
        },
      })

      if (!existingUser) {
        // Находим категорию User4
        const user4Category = await prisma.category.findFirst({
          where: {
            category: 'User4',
          },
        })

        if (user4Category) {
          await prisma.user.create({
            data: {
              name: name.trim(),
              userTypeId: user4Category.id,
            },
          })
        }
      }
    }

    return NextResponse.json({ success: true, data: zapis })
  } catch (error: any) {
    console.error('Ошибка при создании записи zapis:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании записи', message: error.message },
      { status: 500 }
    )
  }
}
