import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Номер не указан' },
        { status: 400 }
      )
    }

    // Ищем пользователя по имени
    const user = await prisma.user.findFirst({
      where: {
        name: name.trim(),
      },
      include: {
        userType: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Номера нет в БД' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        userType: user.userType.category,
        userTypeId: user.userTypeId,
      },
    })
  } catch (error: any) {
    console.error('Ошибка при проверке пользователя:', error)
    return NextResponse.json(
      { error: 'Ошибка при проверке пользователя', message: error.message },
      { status: 500 }
    )
  }
}
