export const formatTime = (timestamp: number, detailed: boolean = false): string => {
  if (!timestamp) return ''

  const now = new Date()
  const messageDate = new Date(timestamp * 1000) 

  const timeDiff = now.getTime() - messageDate.getTime()
  const oneDayMs = 24 * 60 * 60 * 1000
  const oneWeekMs = 7 * oneDayMs

  if (messageDate.toDateString() === now.toDateString()) {
    const hours = messageDate.getHours().toString().padStart(2, '0')
    const minutes = messageDate.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  if (timeDiff < oneDayMs * 2) {
    const hours = messageDate.getHours().toString().padStart(2, '0')
    const minutes = messageDate.getMinutes().toString().padStart(2, '0')
    return `昨天 ${hours}:${minutes}`
  }

  if (timeDiff < oneWeekMs) {
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const weekDay = weekDays[messageDate.getDay()]
    const hours = messageDate.getHours().toString().padStart(2, '0')
    const minutes = messageDate.getMinutes().toString().padStart(2, '0')
    return `${weekDay} ${hours}:${minutes}`
  }

  
  if (messageDate.getFullYear() === now.getFullYear()) {
    const month = (messageDate.getMonth() + 1).toString().padStart(2, '0')
    const day = messageDate.getDate().toString().padStart(2, '0')

    if (detailed) {
      const hours = messageDate.getHours().toString().padStart(2, '0')
      const minutes = messageDate.getMinutes().toString().padStart(2, '0')
      return `${month}月${day}日 ${hours}:${minutes}`
    }

    return `${month}月${day}日`
  }

  const year = messageDate.getFullYear()
  const month = (messageDate.getMonth() + 1).toString().padStart(2, '0')
  const day = messageDate.getDate().toString().padStart(2, '0')

  if (detailed) {
    const hours = messageDate.getHours().toString().padStart(2, '0')
    const minutes = messageDate.getMinutes().toString().padStart(2, '0')
    return `${year}年${month}月${day}日 ${hours}:${minutes}`
  }

  return `${year}年${month}月${day}日`
}

export const formatFileSize = (size: number): string => {
  if (!size) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let fileSize = size
  let unitIndex = 0

  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024
    unitIndex++
  }

  return `${fileSize.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export const formatDuration = (duration: number): string => {
  if (!duration) return '0:00'

  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
