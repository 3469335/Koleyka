import { NextRequest, NextResponse } from 'next/server'
import { getUserSession, setUserSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserSession()
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Ошибка при получении сессии:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении сессии', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user } = body

    if (!user) {
      return NextResponse.json(
        { error: 'Данные пользователя не предоставлены' },
        { status: 400 }
      )
    }

    await setUserSession(user)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Ошибка при сохранении сессии:', error)
    return NextResponse.json(
      { error: 'Ошибка при сохранении сессии', message: error.message },
      { status: 500 }
    )
  }
}
