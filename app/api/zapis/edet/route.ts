import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { canViewEdetList } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

// GET — список номеров автомобилей со статусом "едет" (только для User5)
export async function GET() {
  try {
    const user = await getUserSession()

    if (!user || !canViewEdetList(user)) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const data = await prisma.zapis.findMany({
      where: {
        status: 'едет',
      },
      orderBy: {
        number: 'asc',
      },
      select: {
        id: true,
        number: true,
        name: true,
        trans: true,
      },
    })

    return NextResponse.json({ data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Ошибка при получении списка'
    console.error('Ошибка при получении записей со статусом "едет":', error)
    return NextResponse.json(
      { error: 'Ошибка при получении списка', message },
      { status: 500 }
    )
  }
}
