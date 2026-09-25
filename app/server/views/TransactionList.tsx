import { money, shortDate } from '../format.ts'
import { raw } from 'hono/html'
import type { Transaction } from '../types.ts'

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p class="empty">Nothing here yet. Quiet waters.</p>
  }
  return (
    <table class="transactions" data-testid="transactions">
      <caption class="visually-hidden">Recent transactions</caption>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Description</th>
          <th scope="col" class="numeric">
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t.id}>
            <td>{shortDate(t.date)}</td>
            <td>
              {t.counterparty}
              {t.note ? <span class="transaction-note">{raw(t.note)}</span> : null}
            </td>
            <td class={t.amountMinor < 0 ? 'numeric debit' : 'numeric credit'}>{money(t.amountMinor)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
