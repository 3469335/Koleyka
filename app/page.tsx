'use client'

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') return

    const checkAndRedirect = async () => {
      try {
        // Небольшая задержка для стабилизации и установки куки
        await new Promise(resolve => setTimeout(resolve, 200))
        
        const response = await fetch('/api/auth/session', {
          cache: 'no-store',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })

        if (!response.ok) {
          window.location.href = '/login'
          return
        }

        const data = await response.json()
        
        if (!data.user) {
          window.location.href = '/login'
          return
        }

        // Перенаправляем в зависимости от типа пользователя
        const userType = data.user.userType
        let redirectPath = '/zapis'
        
        if (userType === 'User1') {
          redirectPath = '/view-db/tables'
        } else if (userType === 'User4') {
          redirectPath = '/zapis/my'
        }
        
        // Используем window.location для полной перезагрузки
        // Это гарантирует, что все ресурсы загрузятся заново
        window.location.href = redirectPath
      } catch (error) {
        console.error('Ошибка проверки сессии:', error)
        // Небольшая задержка перед редиректом на случай временных проблем
        setTimeout(() => {
          window.location.href = '/login'
        }, 500)
      }
    }

    checkAndRedirect()
  }, [])

  // Показываем loading state вместо белого экрана
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem',
    }}>
      <div style={{ 
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🚗</div>
        <div style={{ fontSize: '1.25rem', color: '#666', marginBottom: '0.5rem' }}>Koleyka</div>
        <div style={{ fontSize: '0.875rem', color: '#999' }}>Загрузка...</div>
      </div>
    </div>
  )
}
