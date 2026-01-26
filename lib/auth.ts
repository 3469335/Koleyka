import { cookies } from 'next/headers'

export interface User {
  id: string
  name: string
  userType: string // 'User1' | 'User2' | 'User3' | 'User4'
  userTypeId: string
}

const COOKIE_NAME = 'koleyka_user'

export async function setUserSession(user: User) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 дней
  })
}

export async function getUserSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get(COOKIE_NAME)
  
  if (!userCookie?.value) {
    return null
  }

  try {
    return JSON.parse(userCookie.value) as User
  } catch {
    return null
  }
}

export async function clearUserSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
