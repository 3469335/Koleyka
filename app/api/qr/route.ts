import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET - получение URL деплоя для QR-кода
export async function GET(request: NextRequest) {
  try {
    // Получаем URL из переменных окружения или из заголовков запроса
    const vercelUrl = process.env.VERCEL_URL
    const vercelEnv = process.env.VERCEL_ENV
    
    let deployUrl = ''
    
    if (vercelUrl) {
      // На Vercel используем VERCEL_URL
      deployUrl = `https://${vercelUrl}`
    } else {
      // В локальной разработке используем заголовки запроса
      const protocol = request.headers.get('x-forwarded-proto') || 'http'
      const host = request.headers.get('host') || 'localhost:3000'
      deployUrl = `${protocol}://${host}`
    }

    return NextResponse.json({
      url: deployUrl,
      vercelUrl,
      vercelEnv,
    })
  } catch (error: any) {
    console.error('Ошибка при получении URL деплоя:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении URL деплоя', message: error.message },
      { status: 500 }
    )
  }
}
