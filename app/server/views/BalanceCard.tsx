import { money } from '../format.ts'
import type { Account } from '../types.ts'

const icons: Record<Account['type'], string> = {
  current: '🌊',
  savings: '🐚',
}

export function BalanceCard({ account }: { account: Account }) {
  return (
    <article class="balance-card" data-testid={`account-${account.id}`}>
      <span class="balance-card-icon" aria-hidden="true">
        {icons[account.type]}
      </span>
      <h3 class="balance-card-name">{account.name}</h3>
      <p class="balance-card-type">{account.type === 'current' ? 'Current account' : 'Savings account'}</p>
      <p class="balance-card-amount">{money(account.balanceMinor)}</p>
    </article>
  )
}
