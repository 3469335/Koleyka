/** Список типов транспорта для таблицы zapis */
export const TRANSPORT_TYPES = [
  'Автовоз',
  'Рефрижератор',
  'Тент',
  'Контейнер',
  'Трал',
] as const

export type TransportType = (typeof TRANSPORT_TYPES)[number]
