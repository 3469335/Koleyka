'use client'

import { useEffect, useState } from 'react'

export default function QRCodePage() {
  const [deployUrl, setDeployUrl] = useState<string>('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    // Получаем URL деплоя через API
    const fetchDeployUrl = async () => {
      try {
        const response = await fetch('/api/qr')
        if (response.ok) {
          const data = await response.json()
          const url = data.url || window.location.origin
          setDeployUrl(url)
          
          // Генерируем QR-код через внешний API
          const encodedUrl = encodeURIComponent(url)
          const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`
          setQrCodeUrl(qrApiUrl)
        } else {
          // Fallback на текущий URL
          const url = window.location.origin
          setDeployUrl(url)
          const encodedUrl = encodeURIComponent(url)
          const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`
          setQrCodeUrl(qrApiUrl)
        }
      } catch (error) {
        console.error('Ошибка при получении URL:', error)
        // Fallback на текущий URL
        const url = window.location.origin
        setDeployUrl(url)
        const encodedUrl = encodeURIComponent(url)
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`
        setQrCodeUrl(qrApiUrl)
      }
    }

    fetchDeployUrl()
  }, [])

  return (
    <div
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
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
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
          📱 QR-код для доступа
        </h1>

        {qrCodeUrl ? (
          <>
            <div
              style={{
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem',
                background: '#f9f9f9',
                borderRadius: '8px',
              }}
            >
              <img
                src={qrCodeUrl}
                alt="QR Code"
                style={{
                  width: '300px',
                  height: '300px',
                  border: '4px solid #e0e0e0',
                  borderRadius: '8px',
                }}
              />
            </div>

            <div
              style={{
                padding: '1rem',
                background: '#e8f4f8',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                Адрес деплоя:
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#333',
                  wordBreak: 'break-all',
                }}
              >
                {deployUrl}
              </div>
            </div>

            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Отсканируйте QR-код для быстрого доступа к приложению
            </div>
          </>
        ) : (
          <div style={{ padding: '2rem', color: '#666' }}>
            Загрузка QR-кода...
          </div>
        )}
      </div>
    </div>
  )
}
