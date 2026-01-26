import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import { canViewZapis } from '@/lib/permissions'

export default async function ZapisLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserSession()
  
  if (!user || !canViewZapis(user)) {
    redirect('/login')
  }

  return <>{children}</>
}
