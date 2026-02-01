'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface EdetItem {
  id: string
  number: number
  name: string
  trans: string
}

export default function EdetPage() {
  const router = useRouter()
  const [items, setItems] = useState<EdetItem[]>([])
  const [user, setUser] = useState<{ name: string; userType: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
    fetchEdet()
  }, [])

  const checkSession = async () => {
    try {
      await new Promise((r) => setTimeout(r, 200))
      const res = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' })
      if (!res.ok) {
        window.location.href = '/login'
        return
      }
      const data = await res.json()
      if (!data.user || data.user.userType !== 'User5') {
        window.location.href = '/login'
        return
      }
      setUser(data.user)
    } catch {
      setTimeout(() => { window.location.href = '/login' }, 500)
    }
  }

  const fetchEdet = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/zapis/edet')
      if (!res.ok) {
        if (res.status === 403) {
          window.location.href = '/login'
          return
        }
        throw new Error('Ошибка загрузки')
      }
      const json = await res.json()
      setItems(json.data || [])
    } catch {
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
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '1rem',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ fontSize: '1.25rem', color: '#666' }}>Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', color: '#333', margin: 0 }}>
            🚗 Едут
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Выход
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
          Номера автомобилей и тип транспорта со статусом «едет»:
        </p>

        {items.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              background: '#f5f5f5',
              borderRadius: '8px',
              color: '#666',
            }}
          >
            Нет записей со статусом «едет»
          </div>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {items.map((item) => (
              <li
                key={item.id}
                style={{
                  padding: '0.75rem 1rem',
                  background: '#e8f4f8',
                  borderRadius: '8px',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#333',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <span>{item.name}</span>
                <span style={{ fontSize: '1rem', fontWeight: 500, color: '#555' }}>
                  {item.trans}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
