// Статусы, которые исключаются из подсчета очереди
const EXCLUDED_STATUSES = ['недозвон 2', 'отказ', 'заехал']

export function shouldExcludeFromQueue(status: string | null | undefined): boolean {
  if (!status) return false
  return EXCLUDED_STATUSES.includes(status.trim())
}

export function calculateQueueCount(total: number, excluded: number): number {
  return total - excluded
}
