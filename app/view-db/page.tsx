'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ViewDbPage() {
  const router = useRouter()
  const [dbType, setDbType] = useState<'local' | 'production'>('production')
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    setLoading(true)
    try {
      // Сохраняем выбор в sessionStorage
      sessionStorage.setItem('dbType', dbType)
      router.push('/view-db/tables')
    } catch (error) {
      console.error('Ошибка:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#333' }}>
          🔍 Просмотр базы данных
        </h1>

        <div style={{ marginBottom: '2rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#555',
            }}
          >
            Выберите базу данных:
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                border: `2px solid ${dbType === 'production' ? '#667eea' : '#e0e0e0'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                background: dbType === 'production' ? '#f0f4ff' : 'white',
              }}
            >
              <input
                type="radio"
                value="production"
                checked={dbType === 'production'}
                onChange={(e) => setDbType(e.target.value as 'production')}
                style={{ marginRight: '0.75rem', width: '18px', height: '18px' }}
              />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  🚀 Рабочая БД (Production)
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  NeonDB (PostgreSQL)
                </div>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                border: `2px solid ${dbType === 'local' ? '#667eea' : '#e0e0e0'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                background: dbType === 'local' ? '#f0f4ff' : 'white',
              }}
            >
              <input
                type="radio"
                value="local"
                checked={dbType === 'local'}
                onChange={(e) => setDbType(e.target.value as 'local')}
                style={{ marginRight: '0.75rem', width: '18px', height: '18px' }}
              />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  💻 Локальная БД (Local)
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  Локальный PostgreSQL
                </div>
              </div>
            </label>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Загрузка...' : 'Продолжить →'}
        </button>
      </div>
    </div>
  )
}
