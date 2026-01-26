import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'

export default async function Home() {
  const user = await getUserSession()
  
  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!user) {
    redirect('/login')
  }

  // Перенаправляем в зависимости от типа пользователя
  const userType = user.userType
  if (userType === 'User1') {
    redirect('/view-db/tables')
  } else if (userType === 'User4') {
    redirect('/zapis/my')
  } else {
    redirect('/zapis')
  }
}
