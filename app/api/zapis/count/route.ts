import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { canViewZapis } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

// GET - подсчет записей перед указанной записью
export async function GET(request: NextRequest) {
  try {
    const user = await getUserSession()
    
    if (!user || !canViewZapis(user)) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const zapisId = searchParams.get('zapisId')

    if (!zapisId) {
      // Общий подсчет записей в очереди
      const total = await prisma.zapis.count()
      const excludedCount = await prisma.zapis.count({
        where: {
          status: {
            in: ['недозвон 2', 'отказ', 'заехал'],
          },
        },
      })
      const queueCount = total - excludedCount

      return NextResponse.json({
        total,
        queueCount,
      })
    }

    // Подсчет записей перед указанной записью
    const currentZapis = await prisma.zapis.findUnique({
      where: { id: zapisId },
    })

    if (!currentZapis) {
      return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 })
    }

    // Подсчитываем количество записей перед текущей со статусами "заехал", "отказ", "недозвон 2"
    const excludedBeforeCount = await prisma.zapis.count({
      where: {
        number: {
          lt: currentZapis.number,
        },
        status: {
          in: ['недозвон 2', 'отказ', 'заехал'],
        },
      },
    })

    // Количество машин перед ним = номер записи - количество исключенных записей перед ним
    const beforeCount = currentZapis.number - excludedBeforeCount

    return NextResponse.json({
      beforeCount,
      currentNumber: currentZapis.number,
      excludedBeforeCount,
    })
  } catch (error: any) {
    console.error('Ошибка при подсчете записей:', error)
    return NextResponse.json(
      { error: 'Ошибка при подсчете записей', message: error.message },
      { status: 500 }
    )
  }
}
