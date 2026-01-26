import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - получение URL деплоя для QR-кода
export async function GET(request: NextRequest) {
  try {
    // Используем фиксированный URL деплоя или переменную окружения для переопределения
    const deployUrl = process.env.DEPLOY_URL || 'https://koleyka.vercel.app'

    return NextResponse.json({
      url: deployUrl,
    })
  } catch (error: any) {
    console.error('Ошибка при получении URL деплоя:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении URL деплоя', message: error.message },
      { status: 500 }
    )
  }
}
