import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import { canAccessViewDb } from '@/lib/permissions'

export default async function ViewDbLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserSession()
  
  if (!user || !canAccessViewDb(user)) {
    redirect('/login')
  }

  return <>{children}</>
}
