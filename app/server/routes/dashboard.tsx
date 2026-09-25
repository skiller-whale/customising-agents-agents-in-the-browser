import { Hono } from 'hono'
import { Layout } from '../views/Layout.tsx'
import { BalanceCard } from '../views/BalanceCard.tsx'
import { TransactionList } from '../views/TransactionList.tsx'
import { requireUser, type Vars } from '../auth.ts'
import { money } from '../format.ts'
import { accountsFor, findAccount, recentTransactionsFor, transactionsFor } from '../store.ts'

export const dashboard = new Hono<Vars>()

dashboard.use('/', requireUser)
dashboard.use('/accounts/*', requireUser)
dashboard.use('/api/*', requireUser)

dashboard.get('/', (c) => {
  const user = c.get('user')
  const accounts = accountsFor(user.id)
  const recent = recentTransactionsFor(user.id)
  const total = accounts.reduce((sum, a) => sum + a.balanceMinor, 0)

  return c.html(
    <Layout title="Dashboard" user={user} script="/js/dashboard.js">
      <h1>Welcome back, {user.name}</h1>
      <p class="lede">
        You have {accounts.length} open accounts holding <strong>{money(total)}</strong>.
      </p>

      <section aria-labelledby="accounts-heading">
        <h2 id="accounts-heading">Your accounts</h2>
        <div class="card-grid">
          {accounts.map((account) => (
            <a class="card-link" href={`/accounts/${account.id}`} key={account.id}>
              <BalanceCard account={account} />
            </a>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <div class="section-header">
          <h2 id="recent-heading">Recent activity</h2>
          <button type="button" class="secondary" data-testid="export-csv" id="export-csv">
            Export CSV
          </button>
        </div>
        <p class="status" data-testid="export-status" id="export-status" role="status"></p>
        <TransactionList transactions={recent} />
      </section>
    </Layout>,
  )
})

dashboard.get('/accounts/:id', (c) => {
  const user = c.get('user')
  const account = findAccount(c.req.param('id'))
  if (!account || account.userId !== user.id) return c.notFound()

  return c.html(
    <Layout title={account.name} user={user}>
      <p class="breadcrumb">
        <a href="/">← Back to dashboard</a>
      </p>
      <h1>{account.name}</h1>
      <p class="big-balance" data-testid="account-balance">
        {money(account.balanceMinor)}
      </p>
      <TransactionList transactions={transactionsFor(account.id)} />
    </Layout>,
  )
})

/** Feeds the Export CSV button on the dashboard. */
dashboard.get('/api/transactions', (c) => {
  const user = c.get('user')
  return c.json({ items: recentTransactionsFor(user.id, 100) })
})
