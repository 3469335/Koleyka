import { NextRequest, NextResponse } from 'next/server'
import { clearUserSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await clearUserSession()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Ошибка при выходе:', error)
    return NextResponse.json(
      { error: 'Ошибка при выходе', message: error.message },
      { status: 500 }
    )
  }
}
