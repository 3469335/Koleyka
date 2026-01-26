import { prisma } from '@/lib/prisma'

async function getZapis() {
  try {
    const zapis = await prisma.zapis.findMany({
      orderBy: {
        number: 'asc',
      },
      take: 10, // Показываем первые 10 записей
    })
    return zapis
  } catch (error) {
    console.error('Ошибка при получении записей:', error)
    return []
  }
}

export default async function Home() {
  const zapis = await getZapis()

  return (
    <main style={{ maxWidth: '1000px', margin: '2rem auto', padding: '2rem' }}>
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#333',
          }}
        >
          🚗 Записи очереди из PostgreSQL (NeonDB)
        </h1>

        <div style={{ marginBottom: '1.5rem' }}>
          <a
            href="/view-db"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1.5rem',
              background: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            🔍 Просмотр базы данных →
          </a>
        </div>

        {zapis.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#666',
              background: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            <p>Записей пока нет. Запустите seed для добавления тестовых данных:</p>
            <code style={{ display: 'block', marginTop: '1rem', padding: '0.5rem', background: '#e0e0e0', borderRadius: '4px' }}>
              npm run db:seed
            </code>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {zapis.map((zapisItem) => (
              <div
                key={zapisItem.id}
                style={{
                  padding: '1.5rem',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h2
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#333',
                    }}
                  >
                    #{zapisItem.number} - {zapisItem.name}
                  </h2>
                  {zapisItem.zvonok && (
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#e0e0e0',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: '#555',
                      }}
                    >
                      {zapisItem.zvonok}
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                  <div><strong>Транспорт:</strong> {zapisItem.trans}</div>
                  {zapisItem.telephon && <div><strong>Телефон:</strong> {zapisItem.telephon}</div>}
                  {zapisItem.srokDost && (
                    <div><strong>Срок доставки:</strong> {new Date(zapisItem.srokDost).toLocaleDateString('ru-RU')}</div>
                  )}
                  {zapisItem.datObr && (
                    <div><strong>Дата обработки:</strong> {new Date(zapisItem.datObr).toLocaleDateString('ru-RU')}</div>
                  )}
                  {zapisItem.timObr && <div><strong>Время обработки:</strong> {zapisItem.timObr}</div>}
                </div>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: '#999',
                    marginTop: '0.5rem',
                    fontFamily: 'monospace',
                  }}
                >
                  ID: {zapisItem.id}
                </p>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#e8f4f8',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: '#555',
          }}
        >
          <strong>✅ Статус:</strong> Подключение к базе данных работает! Всего
          записей: {zapis.length}
        </div>
      </div>
    </main>
  )
}
