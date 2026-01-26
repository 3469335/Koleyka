'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getRowStyle } from '@/lib/row-styles'

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

export default function ZapisPage() {
  const router = useRouter()
  const [zapis, setZapis] = useState<Zapis[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [queueCount, setQueueCount] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Zapis | null>(null)
  const [formData, setFormData] = useState<Partial<Zapis>>({})

  useEffect(() => {
    checkSession()
    fetchZapis()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUser(data.user)
    } catch (error) {
      console.error('Ошибка проверки сессии:', error)
      router.push('/login')
    }
  }

  const fetchZapis = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/zapis?page=1&pageSize=1000')
      if (!response.ok) throw new Error('Ошибка загрузки данных')
      const data = await response.json()
      setZapis(data.data)
      setQueueCount(data.queueCount)
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

  const canEdit = user?.userType === 'User1' || user?.userType === 'User3'
  const canCreate = user?.userType === 'User1' || user?.userType === 'User3'

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/zapis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка создания')
      }

      setShowCreateModal(false)
      setFormData({})
      fetchZapis()
    } catch (error: any) {
      alert(error.message || 'Ошибка при создании записи')
    }
  }

  const handleUpdate = async () => {
    if (!editingRecord) return

    try {
      const response = await fetch(`/api/zapis/${editingRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка обновления')
      }

      setShowEditModal(false)
      setEditingRecord(null)
      setFormData({})
      fetchZapis()
    } catch (error: any) {
      alert(error.message || 'Ошибка при обновлении записи')
    }
  }

  const openEditModal = (record: Zapis) => {
    setEditingRecord(record)
    setFormData({ ...record })
    setShowEditModal(true)
  }

  const openCreateModal = () => {
    setFormData({
      number: zapis.length > 0 ? Math.max(...zapis.map(z => z.number)) + 1 : 1,
      name: '',
      trans: '',
      status: ' ',
    })
    setShowCreateModal(true)
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', color: '#666' }}>Загрузка данных...</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '2rem auto', padding: '2rem' }}>
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '0.5rem' }}>
              🚗 Записи очереди
            </h1>
            {user && (
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                Пользователь: <strong>{user.name}</strong> ({user.userType})
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {canCreate && (
              <button
                onClick={openCreateModal}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                + Создать
              </button>
            )}
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

        <div
          style={{
            padding: '1rem',
            background: '#e8f4f8',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: '#555',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          <strong>📊 Автомобилей в очереди:</strong> {queueCount}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600', fontSize: '0.875rem' }}>№</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600', fontSize: '0.875rem' }}>Номер авто</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600', fontSize: '0.875rem' }}>Транспорт</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600', fontSize: '0.875rem' }}>Срок доставки</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600', fontSize: '0.875rem' }}>Дата обработки</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600', fontSize: '0.875rem' }}>Время обработки</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600', fontSize: '0.875rem' }}>Телефон</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: '600', fontSize: '0.875rem' }}>Статус</th>
                {canEdit && (
                  <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e0e0e0', fontWeight: '600', fontSize: '0.875rem' }}>Действия</th>
                )}
              </tr>
            </thead>
            <tbody>
              {zapis.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 9 : 8} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    Нет данных
                  </td>
                </tr>
              ) : (
                zapis.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      ...getRowStyle(item.status),
                      borderBottom: '1px solid #e0e0e0',
                    }}
                  >
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{item.number}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: '600' }}>{item.name}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{item.trans}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      {item.srokDost ? new Date(item.srokDost).toLocaleDateString('ru-RU') : '—'}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      {item.datObr ? new Date(item.datObr).toLocaleDateString('ru-RU') : '—'}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{item.timObr || '—'}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{item.telephon || '—'}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{item.status || '—'}</td>
                    {canEdit && (
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button
                          onClick={() => openEditModal(item)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Изменить
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Модальное окно создания */}
        {showCreateModal && (
          <ZapisModal
            title="Создать запись"
            onClose={() => {
              setShowCreateModal(false)
              setFormData({})
            }}
            onSave={handleCreate}
            formData={formData}
            setFormData={setFormData}
          />
        )}

        {/* Модальное окно редактирования */}
        {showEditModal && editingRecord && (
          <ZapisModal
            title="Редактировать запись"
            onClose={() => {
              setShowEditModal(false)
              setEditingRecord(null)
              setFormData({})
            }}
            onSave={handleUpdate}
            formData={formData}
            setFormData={setFormData}
          />
        )}
      </div>
    </div>
  )
}

// Компонент модального окна
function ZapisModal({
  title,
  onClose,
  onSave,
  formData,
  setFormData,
}: {
  title: string
  onClose: () => void
  onSave: () => void
  formData: Partial<Zapis>
  setFormData: (data: Partial<Zapis>) => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#333' }}>{title}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#555' }}>
              Номер <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              value={formData.number || ''}
              onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 0 })}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#555' }}>
              Номер автомобиля <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#555' }}>
              Транспорт <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.trans || ''}
              onChange={(e) => setFormData({ ...formData, trans: e.target.value })}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#555' }}>
              Срок доставки
            </label>
            <input
              type="date"
              value={formData.srokDost ? new Date(formData.srokDost).toISOString().slice(0, 10) : ''}
              onChange={(e) => setFormData({ ...formData, srokDost: e.target.value || null })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#555' }}>
              Дата обработки
            </label>
            <input
              type="date"
              value={formData.datObr ? new Date(formData.datObr).toISOString().slice(0, 10) : ''}
              onChange={(e) => setFormData({ ...formData, datObr: e.target.value || null })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#555' }}>
              Время обработки
            </label>
            <input
              type="text"
              value={formData.timObr || ''}
              onChange={(e) => setFormData({ ...formData, timObr: e.target.value || null })}
              placeholder="09:00"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#555' }}>
              Телефон
            </label>
            <input
              type="text"
              value={formData.telephon || ''}
              onChange={(e) => setFormData({ ...formData, telephon: e.target.value || null })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem', color: '#555' }}>
              Статус
            </label>
            <select
              value={formData.status || ' '}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.875rem' }}
            >
              <option value=" "> </option>
              <option value="едет">едет</option>
              <option value="звонить утром">звонить утром</option>
              <option value="недозвон 1">недозвон 1</option>
              <option value="недозвон 2">недозвон 2</option>
              <option value="отказ">отказ</option>
              <option value="ремонт">ремонт</option>
              <option value="заехал">заехал</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#e0e0e0',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Отмена
          </button>
          <button
            onClick={onSave}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}
