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
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      if (!data.user || data.user.userType !== 'User4') {
        router.push('/login')
        return
      }
      setUser(data.user)
    } catch (error) {
      console.error('Ошибка проверки сессии:', error)
      router.push('/login')
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
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', color: '#666' }}>Загрузка данных...</div>
      </div>
    )
  }

  if (!zapis) {
    return (
      <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '2rem' }}>
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '1rem' }}>
            Ваша запись не найдена
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
            }}
          >
            Выход
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '2rem' }}>
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#333' }}>
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
            }}
          >
            Выход
          </button>
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
          📊 В очереди перед вами: <strong>{beforeCount}</strong> автомобилей
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
              <strong style={{ fontSize: '0.875rem', color: '#666' }}>Номер в очереди:</strong>
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
