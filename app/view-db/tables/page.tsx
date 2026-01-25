'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Table {
  name: string
  count: number
}

export default function TablesPage() {
  const router = useRouter()
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [dbType, setDbType] = useState<string>('production')

  useEffect(() => {
    const storedDbType = sessionStorage.getItem('dbType') || 'production'
    setDbType(storedDbType)
    fetchTables(storedDbType)
  }, [])

  const fetchTables = async (type: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/view-db/tables?dbType=${type}`)
      if (!response.ok) throw new Error('Ошибка загрузки таблиц')
      const data = await response.json()
      setTables(data.tables)
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Ошибка загрузки таблиц. Проверьте подключение к БД.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', color: '#666' }}>Загрузка таблиц...</div>
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
            📊 Таблицы базы данных
          </h1>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            БД: <strong>{dbType === 'production' ? 'Рабочая' : 'Локальная'}</strong>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <Link
            href="/view-db"
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            ← Выбрать другую БД
          </Link>
        </div>

        {tables.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#666',
              background: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            Таблицы не найдены
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {tables.map((table) => (
              <div
                key={table.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.5rem',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem', color: '#333' }}>
                    {table.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#666' }}>
                    Записей: {table.count}
                  </p>
                </div>
                <Link
                  href={`/view-db/table/${table.name}?dbType=${dbType}`}
                  style={{
                    padding: '0.5rem 1.5rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Открыть →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
