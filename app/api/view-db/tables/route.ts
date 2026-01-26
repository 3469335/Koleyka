import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma-db'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dbType = (searchParams.get('dbType') || 'production') as 'local' | 'production'
    
    const prisma = getPrismaClient(dbType)

    // Получаем список таблиц из схемы Prisma
    const models = Prisma.dmmf.datamodel.models
    const tables = []

    for (const model of models) {
      try {
        // Prisma использует camelCase с первой строчной буквой
        const modelName = model.name.charAt(0).toLowerCase() + model.name.slice(1)
        const count = await (prisma as any)[modelName].count()
        tables.push({
          name: model.dbName || model.name,
          count,
        })
      } catch (error) {
        // Если таблица не существует или ошибка, пропускаем
        console.error(`Ошибка при получении данных для ${model.name}:`, error)
        tables.push({
          name: model.dbName || model.name,
          count: 0,
        })
      }
    }

    return NextResponse.json({ tables })
  } catch (error) {
    console.error('Ошибка при получении списка таблиц:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении списка таблиц' },
      { status: 500 }
    )
  }
}
