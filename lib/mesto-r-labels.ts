/** Отображение значений места разгрузки: старые названия → новые */
const MESTO_R_DISPLAY: Record<string, string> = {
  'Другое': 'Без разгрузки',
  'Рампа1': 'Авто',
  'Рампа2': 'Склад',
}

export function formatMestoR(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  return MESTO_R_DISPLAY[value] ?? value
}
