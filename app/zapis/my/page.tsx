'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Zapis {
  id: string
  number: number
  name: string
  trans: string
  srokDost: string | null
  datObr: string | null
  timObr: string | null
  datRazm: string | null
  timRazm: string | null
  telephon: string | null
  status: string | null
}

interface User {
  id: string
  name: string
  userType: string
  userTypeId: string
}

export default function MyZapisPage() {
  const router = useRouter()
  const [zapis, setZapis] = useState<Zapis | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [beforeCount, setBeforeCount] = useState(0)

  useEffect(() => {
    checkSession()
    fetchMyZapis()
  }, [])

  const checkSession = async () => {
    try {
      // Добавляем небольшую задержку для установки куки после редиректа
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const response = await fetch('/api/auth/session', {
        cache: 'no-store',
        credentials: 'include',
      })
      
      if (!response.ok) {
        router.push('/login')
        return
      }
      
      const data = await response.json()
      if (!data.user || data.user.userType !== 'User4') {
        router.push('/login')
        return
      }
      setUser(data.user)
    } catch (error) {
      console.error('Ошибка проверки сессии:', error)
      // Не редиректим сразу, даем время на повторную попытку
      setTimeout(() => {
        router.push('/login')
      }, 500)
    }
  }

  const fetchMyZapis = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/zapis?page=1&pageSize=1')
      if (!response.ok) throw new Error('Ошибка загрузки данных')
      const data = await response.json()
      
      if (data.data && data.data.length > 0) {
        setZapis(data.data[0])
        
        // Получаем количество записей перед текущей
        const countResponse = await fetch(`/api/zapis/count?zapisId=${data.data[0].id}`)
        if (countResponse.ok) {
          const countData = await countResponse.json()
          setBeforeCount(countData.beforeCount || 0)
        }
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  if (loading) {
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
          <div style={{ fontSize: '1.25rem', color: '#666', marginBottom: '1rem' }}>Загрузка данных...</div>
          <div style={{ fontSize: '0.875rem', color: '#999' }}>Пожалуйста, подождите</div>
        </div>
      </div>
    )
  }

  if (!zapis) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1rem',
      }}>
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '1rem' }}>
            Ваша запись не найдена
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1.5rem' }}>
            Обратитесь к администратору для создания записи
          </p>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Выход
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '1rem',
      minHeight: '100vh',
      position: 'relative',
      zIndex: 1,
    }}>
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 2,
          color: '#333',
          opacity: 1,
          visibility: 'visible',
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ 
              fontSize: '1.25rem', 
              color: '#333', 
              margin: 0,
              opacity: 1,
              visibility: 'visible',
              display: 'block',
            }}>
              🚗 Ваша запись в очереди
            </h1>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1.5rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Выход
            </button>
          </div>
        </div>

        <div
          style={{
            padding: '1rem',
            background: '#e8f4f8',
            borderRadius: '8px',
            fontSize: '1rem',
            color: '#555',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontWeight: '600',
          }}
        >
          <span style={{ opacity: 1, visibility: 'visible', color: '#555' }}>
            📊 Ваш номер в очереди: <strong style={{ color: '#333' }}>{beforeCount}</strong>
          </span>
        </div>

        <div
          style={{
            padding: '1.5rem',
            background: '#f9f9f9',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <strong style={{ fontSize: '0.875rem', color: '#666' }}>Номер по списку:</strong>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333' }}>#{zapis.number}</div>
            </div>
            <div>
              <strong style={{ fontSize: '0.875rem', color: '#666' }}>Номер автомобиля:</strong>
              <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333' }}>{zapis.name}</div>
            </div>
            <div>
              <strong style={{ fontSize: '0.875rem', color: '#666' }}>Транспорт:</strong>
              <div style={{ fontSize: '1rem', color: '#333' }}>{zapis.trans}</div>
            </div>
            {zapis.status && (
              <div>
                <strong style={{ fontSize: '0.875rem', color: '#666' }}>Статус:</strong>
                <div style={{ fontSize: '1rem', color: '#333' }}>{zapis.status}</div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem', color: '#666' }}>
            {zapis.srokDost && (
              <div>
                <strong>Срок доставки:</strong> {new Date(zapis.srokDost).toLocaleDateString('ru-RU')}
              </div>
            )}
            {zapis.datObr && (
              <div>
                <strong>Дата обращения:</strong> {new Date(zapis.datObr).toLocaleDateString('ru-RU')}
              </div>
            )}
            {zapis.timObr && (
              <div>
                <strong>Время обращения:</strong> {zapis.timObr}
              </div>
            )}
            {zapis.telephon && (
              <div>
                <strong>Телефон:</strong> {zapis.telephon}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
