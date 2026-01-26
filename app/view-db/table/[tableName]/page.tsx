'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Field {
  name: string
  type: string
  isRequired: boolean
  isId: boolean
  relationName?: string
}

interface TableData {
  tableName: string
  fields: Field[]
  data: any[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export default function TableViewPage({ params }: { params: { tableName: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dbType = searchParams.get('dbType') || 'production'
  const [tableData, setTableData] = useState<TableData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [categories, setCategories] = useState<Array<{ id: string; category: string }>>([])

  useEffect(() => {
    fetchTableData()
  }, [params.tableName, page, dbType])

  const fetchTableData = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/view-db/table?tableName=${params.tableName}&dbType=${dbType}&page=${page}&pageSize=10`
      )
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || 'Ошибка загрузки данных')
      }
      const data = await response.json()
      if (data.error) {
        throw new Error(data.message || data.error)
      }
      setTableData(data)
    } catch (error: any) {
      console.error('Ошибка:', error)
      alert(`Ошибка загрузки данных таблицы: ${error.message || error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/view-db/table/crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: params.tableName,
          dbType,
          data: formData,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка создания')
      }

      setShowCreateModal(false)
      setFormData({})
      fetchTableData()
    } catch (error: any) {
      alert(error.message || 'Ошибка при создании записи')
    }
  }

  const handleUpdate = async () => {
    try {
      const idField = tableData?.fields.find((f) => f.isId)?.name || 'id'
      const response = await fetch('/api/view-db/table/crud', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: params.tableName,
          dbType,
          id: editingRecord[idField],
          data: formData,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка обновления')
      }

      setShowEditModal(false)
      setEditingRecord(null)
      setFormData({})
      fetchTableData()
    } catch (error: any) {
      alert(error.message || 'Ошибка при обновлении записи')
    }
  }

  const handleDelete = async (record: any) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return

    try {
      const idField = tableData?.fields.find((f) => f.isId)?.name || 'id'
      const response = await fetch(
        `/api/view-db/table/crud?tableName=${params.tableName}&dbType=${dbType}&id=${record[idField]}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка удаления')
      }

      fetchTableData()
    } catch (error: any) {
      alert(error.message || 'Ошибка при удалении записи')
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/view-db/categories?dbType=${dbType}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error)
    }
  }

  const openEditModal = async (record: any) => {
    setEditingRecord(record)
    setFormData({ ...record })
    if (params.tableName === 'users') {
      await fetchCategories()
    }
    setShowEditModal(true)
  }

  const openCreateModal = async () => {
    const initialData: any = {}
    tableData?.fields.forEach((field) => {
      if (!field.isId) {
        initialData[field.name] = ''
      }
    })
    setFormData(initialData)
    if (params.tableName === 'users') {
      await fetchCategories()
    }
    setShowCreateModal(true)
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', color: '#666' }}>Загрузка данных...</div>
      </div>
    )
  }

  if (!tableData) {
    return (
      <div style={{ maxWidth: '1400px', margin: '2rem auto', padding: '2rem' }}>
        <div style={{ color: 'red' }}>Таблица не найдена</div>
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
            <Link
              href="/view-db/tables"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
                display: 'block',
              }}
            >
              ← Назад к списку таблиц
            </Link>
            <h1 style={{ fontSize: '1.5rem', color: '#333' }}>
              📋 Таблица: {tableData.tableName}
            </h1>
          </div>
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
        </div>

        <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                {tableData.fields.map((field) => (
                  <th
                    key={field.name}
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      borderBottom: '2px solid #e0e0e0',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      color: '#555',
                    }}
                  >
                    {field.name}
                    {field.isId && ' (ID)'}
                    {field.isRequired && ' *'}
                  </th>
                ))}
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                    borderBottom: '2px solid #e0e0e0',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    color: '#555',
                  }}
                >
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={tableData.fields.length + 1}
                    style={{ padding: '2rem', textAlign: 'center', color: '#666' }}
                  >
                    Нет данных
                  </td>
                </tr>
              ) : (
                tableData.data.map((record, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    {tableData.fields.map((field) => (
                      <td
                        key={field.name}
                        style={{
                          padding: '0.75rem',
                          fontSize: '0.875rem',
                          color: '#333',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={String(record[field.name] || '')}
                      >
                        {formatValue(record[field.name], field.type, field.name, params.tableName)}
                      </td>
                    ))}
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <button
                        onClick={() => openEditModal(record)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          marginRight: '0.5rem',
                          cursor: 'pointer',
                        }}
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDelete(record)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        {tableData.pagination.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Страница {tableData.pagination.page} из {tableData.pagination.totalPages} (
              {tableData.pagination.total} записей)
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                style={{
                  padding: '0.5rem 1rem',
                  background: page === 1 ? '#e0e0e0' : '#667eea',
                  color: page === 1 ? '#999' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ← Назад
              </button>
              <button
                onClick={() => setPage(Math.min(tableData.pagination.totalPages, page + 1))}
                disabled={page === tableData.pagination.totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  background:
                    page === tableData.pagination.totalPages ? '#e0e0e0' : '#667eea',
                  color: page === tableData.pagination.totalPages ? '#999' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: page === tableData.pagination.totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Вперед →
              </button>
            </div>
          </div>
        )}

        {/* Модальное окно создания */}
        {showCreateModal && (
          <Modal
            title="Создать запись"
            onClose={() => {
              setShowCreateModal(false)
              setFormData({})
            }}
            onSave={handleCreate}
            fields={tableData.fields}
            formData={formData}
            setFormData={setFormData}
            tableName={params.tableName}
            categories={categories}
          />
        )}

        {/* Модальное окно редактирования */}
        {showEditModal && editingRecord && (
          <Modal
            title="Редактировать запись"
            onClose={() => {
              setShowEditModal(false)
              setEditingRecord(null)
              setFormData({})
            }}
            onSave={handleUpdate}
            fields={tableData.fields}
            formData={formData}
            setFormData={setFormData}
            tableName={params.tableName}
            categories={categories}
          />
        )}
      </div>
    </div>
  )
}

// Компонент модального окна
function Modal({
  title,
  onClose,
  onSave,
  fields,
  formData,
  setFormData,
  tableName,
  categories,
}: {
  title: string
  onClose: () => void
  onSave: () => void
  fields: Field[]
  formData: any
  setFormData: (data: any) => void
  tableName?: string
  categories?: Array<{ id: string; category: string }>
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
          {fields
            .filter((field) => !field.isId || formData[field.name])
            .map((field) => (
              <div key={field.name}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    color: '#555',
                  }}
                >
                  {field.name}
                  {field.isRequired && <span style={{ color: 'red' }}> *</span>}
                </label>
                {tableName === 'users' && field.name === 'category' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    required={field.isRequired}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="">Выберите категорию</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.category}>
                        {cat.category}
                      </option>
                    ))}
                  </select>
                ) : tableName === 'zapis' && field.name === 'status' ? (
                  <select
                    value={formData[field.name] || ' '}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    required={field.isRequired}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
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
                ) : field.type === 'DateTime' ? (
                  // Для полей srokDost и datObr в таблице zapis используем input type="date"
                  tableName === 'zapis' && (field.name === 'srokDost' || field.name === 'datObr') ? (
                    <input
                      type="date"
                      value={
                        formData[field.name]
                          ? new Date(formData[field.name]).toISOString().slice(0, 10)
                          : ''
                      }
                      onChange={(e) => {
                        // Сохраняем дату как строку в формате YYYY-MM-DD, время будет установлено на сервере
                        setFormData({ ...formData, [field.name]: e.target.value || '' })
                      }}
                      required={field.isRequired}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    />
                  ) : (
                    <input
                      type="datetime-local"
                      value={
                        formData[field.name]
                          ? new Date(formData[field.name]).toISOString().slice(0, 16)
                          : ''
                      }
                      onChange={(e) =>
                        setFormData({ ...formData, [field.name]: e.target.value })
                      }
                      required={field.isRequired}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    />
                  )
                ) : field.type === 'Int' ? (
                  <input
                    type="number"
                    value={formData[field.name] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: parseInt(e.target.value) || 0 })
                    }
                    required={field.isRequired}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    required={field.isRequired}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  />
                )}
              </div>
            ))}
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

// Форматирование значения для отображения
function formatValue(value: any, type: string, fieldName?: string, tableName?: string): string {
  if (value === null || value === undefined) return '—'
  if (type === 'DateTime' && value) {
    // Для полей srokDost и datObr в таблице zapis показываем только дату
    if (tableName === 'zapis' && (fieldName === 'srokDost' || fieldName === 'datObr')) {
      return new Date(value).toLocaleDateString('ru-RU')
    }
    return new Date(value).toLocaleString('ru-RU')
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}
