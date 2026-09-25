/** Money is stored in minor units (pence) everywhere. Format only at the edges. */
export function money(amountMinor: number): string {
  const sign = amountMinor < 0 ? '-' : ''
  const pounds = (Math.abs(amountMinor) / 100).toFixed(2)
  return `${sign}£${Number(pounds).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`
}

export function shortDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${Number(day)} ${months[Number(month) - 1]} ${year}`
}
