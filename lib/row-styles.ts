export function getRowStyle(status: string | null | undefined): Record<string, string> {
  if (!status) {
    return {}
  }

  const statusTrimmed = status.trim()

  switch (statusTrimmed) {
    case 'заехал':
      return {
        backgroundColor: '#d1fae5', // светло-зеленый
      }
    case 'едет':
      return {
        backgroundColor: '#ecfdf5', // очень светло-зеленый
      }
    case 'недозвон 2':
    case 'отказ':
      return {
        backgroundColor: '#dbeafe', // светло-синий
      }
    case 'ремонт':
      return {
        backgroundColor: '#fef3c7', // светло-желтый
      }
    default:
      return {}
  }
}
