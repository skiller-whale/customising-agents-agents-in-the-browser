import { Hono } from 'hono'
import { Layout } from '../views/Layout.tsx'
import { requireUser, type Vars } from '../auth.ts'
import { money } from '../format.ts'
import { accountsFor, findAccount, transfer } from '../store.ts'

export const transferRoutes = new Hono<Vars>()

transferRoutes.use('/transfer', requireUser)
transferRoutes.use('/api/transfers', requireUser)

transferRoutes.get('/transfer', (c) => {
  const user = c.get('user')
  const accounts = accountsFor(user.id)

  return c.html(
    <Layout title="Transfer" user={user} script="/js/transfer.js">
      <div class="narrow">
        <h1>Move money</h1>
        <p class="lede">Between your own accounts. No fees, no fins attached.</p>

        <form id="transfer-form" class="stack" method="post" action="/api/transfers" data-testid="transfer-form">
          <div class="field">
            <label for="fromAccountId">From</label>
            <select id="fromAccountId" name="fromAccountId" required>
              {accounts.map((a) => (
                <option value={a.id} key={a.id}>
                  {a.name} — {money(a.balanceMinor)}
                </option>
              ))}
            </select>
          </div>

          <div class="field">
            <label for="toAccountId">To</label>
            <select id="toAccountId" name="toAccountId" required>
              {accounts.map((a) => (
                <option value={a.id} key={a.id} selected={a.id === accounts[1]?.id}>
                  {a.name} — {money(a.balanceMinor)}
                </option>
              ))}
            </select>
          </div>

          <div class="field">
            <label for="amount">Amount (£)</label>
            <input type="number" id="amount" name="amount" min="0.01" step="0.01" value="10.00" required />
          </div>

          <div class="field">
            <label for="reference">Reference</label>
            <input type="text" id="reference" name="reference" maxlength={40} placeholder="Krill money" />
          </div>

          <button type="submit" class="primary" data-testid="submit-transfer">
            Send it
          </button>
        </form>

        <p class="status" id="transfer-status" data-testid="transfer-status" role="status"></p>
      </div>
    </Layout>,
  )
})

transferRoutes.post('/api/transfers', async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => null)

  if (!body || typeof body !== 'object') {
    return c.json({ error: 'Expected a JSON body' }, 400)
  }

  const { fromAccountId, toAccountId, amountMinor, reference } = body as Record<string, unknown>

  if (typeof fromAccountId !== 'string' || typeof toAccountId !== 'string') {
    return c.json({ error: 'fromAccountId and toAccountId are required strings' }, 400)
  }
  if (typeof amountMinor !== 'number') {
    return c.json(
      { error: `amountMinor must be a number of pence, got ${typeof amountMinor}: ${JSON.stringify(amountMinor)}` },
      400,
    )
  }

  const from = findAccount(fromAccountId)
  if (!from || from.userId !== user.id) {
    return c.json({ error: `You do not own account "${fromAccountId}"` }, 403)
  }

  const result = transfer(fromAccountId, toAccountId, amountMinor, String(reference ?? ''))
  if (!result.ok) return c.json({ error: result.error }, 400)

  return c.json({ ok: true, transaction: result.transaction })
})
