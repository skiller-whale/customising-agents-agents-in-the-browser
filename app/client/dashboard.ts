/** Export the recent transactions as a CSV file. */
const button = document.querySelector<HTMLButtonElement>('#export-csv')
const status = document.querySelector<HTMLParagraphElement>('#export-status')

button?.addEventListener('click', async () => {
  const response = await fetch('/api/transactions')
  const data = await response.json()

  const rows = data.transactions.map(
    (t: { date: string; counterparty: string; amountMinor: number }) =>
      `${t.date},"${t.counterparty}",${(t.amountMinor / 100).toFixed(2)}`,
  )
  const csv = ['date,description,amount', ...rows].join('\n')

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'fintech-transactions.csv'
  link.click()
  URL.revokeObjectURL(url)

  if (status) status.textContent = `Exported ${rows.length} transactions.`
})
