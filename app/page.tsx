import { prisma } from '@/lib/prisma'

async function getNotes() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return notes
  } catch (error) {
    console.error('Ошибка при получении заметок:', error)
    return []
  }
}

export default async function Home() {
  const notes = await getNotes()

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto' }}>
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
          📝 Заметки из PostgreSQL (NeonDB)
        </h1>

        {notes.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#666',
              background: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            <p>Заметок пока нет. Запустите seed для добавления тестовых данных:</p>
            <code style={{ display: 'block', marginTop: '1rem', padding: '0.5rem', background: '#e0e0e0', borderRadius: '4px' }}>
              npm run db:seed
            </code>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notes.map((note) => (
              <div
                key={note.id}
                style={{
                  padding: '1.5rem',
                  background: '#f9f9f9',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#333',
                  }}
                >
                  {note.title}
                </h2>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#666',
                  }}
                >
                  Создано: {new Date(note.createdAt).toLocaleString('ru-RU')}
                </p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: '#999',
                    marginTop: '0.25rem',
                    fontFamily: 'monospace',
                  }}
                >
                  ID: {note.id}
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
          заметок: {notes.length}
        </div>
      </div>
    </main>
  )
}
