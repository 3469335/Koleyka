import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/prisma-db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dbType = (searchParams.get('dbType') || 'production') as 'local' | 'production'
    
    const prisma = getPrismaClient(dbType)
    const categories = await prisma.category.findMany({
      orderBy: { category: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Ошибка при получении категорий:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении категорий' },
      { status: 500 }
    )
  }
}
