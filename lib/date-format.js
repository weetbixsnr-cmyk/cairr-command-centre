const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

export function formatDashboardDateTime(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  if (Number.isNaN(date.getTime())) return '—'

  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const suffix = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12 || 12

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${String(hours).padStart(2, '0')}:${minutes} ${suffix}`
}
