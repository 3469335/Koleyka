'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ошибка при входе')
        setLoading(false)
        return
      }

      // Сохраняем сессию через cookie
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: data.user }),
      })

      if (!sessionResponse.ok) {
        throw new Error('Ошибка сохранения сессии')
      }

      // Перенаправляем в зависимости от типа пользователя
      const userType = data.user.userType
      if (userType === 'User1') {
        router.push('/view-db/tables')
      } else if (userType === 'User4') {
        router.push('/zapis/my')
      } else {
        router.push('/zapis')
      }
      
      // Обновляем страницу для применения изменений
      router.refresh()
    } catch (error: any) {
      console.error('Ошибка:', error)
      setError('Ошибка при подключении к серверу')
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '3rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#333',
            textAlign: 'center',
          }}
        >
          🚗 Koleyka
        </h1>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#666',
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          Система управления очередью
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="name"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                color: '#555',
              }}
            >
              Введите номер
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#667eea')}
              onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '0.75rem',
                background: '#fee2e2',
                color: '#dc2626',
                borderRadius: '6px',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading || !name.trim() ? '#e0e0e0' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </main>
  )
}
