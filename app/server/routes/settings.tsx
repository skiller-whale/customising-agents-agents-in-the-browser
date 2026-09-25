import { Hono } from 'hono'
import { Layout } from '../views/Layout.tsx'
import { requireUser, type Vars } from '../auth.ts'
import { money } from '../format.ts'
import { allAccountsFor, archiveAccount, findAccount } from '../store.ts'

export const settings = new Hono<Vars>()

settings.use('/settings', requireUser)
settings.use('/accounts/:id/archive', requireUser)

settings.get('/settings', (c) => {
  const user = c.get('user')
  const accounts = allAccountsFor(user.id)
  const closed = c.req.query('closed')

  return c.html(
    <Layout title="Settings" user={user}>
      <div class="narrow">
        <h1>Settings</h1>

        {closed ? (
          <p class="alert success" role="status" data-testid="archive-confirmation">
            Account closed. It has been quietly returned to the sea.
          </p>
        ) : null}

        <section aria-labelledby="profile-heading">
          <h2 id="profile-heading">Profile</h2>
          <dl class="profile">
            <dt>Name</dt>
            <dd data-testid="profile-name">
              {user.name}
              <button type="button" class="icon-button" data-testid="edit-name">
                ✏️
              </button>
            </dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Species</dt>
            <dd>{user.species}</dd>
            <dt>Role</dt>
            <dd>{user.role}</dd>
          </dl>
        </section>

        <section aria-labelledby="accounts-heading" class="accounts-section">
          <h2 id="accounts-heading">Your accounts</h2>
          <ul class="account-settings-list">
            {accounts.map((account) => (
              <li key={account.id} class={account.archived ? 'archived' : ''}>
                <div>
                  <strong>{account.name}</strong>
                  <span class="muted"> · {money(account.balanceMinor)}</span>
                </div>
                {account.archived ? (
                  <span class="pill">Closed</span>
                ) : (
                  <form method="post" action={`/accounts/${account.id}/archive`}>
                    <button type="submit" class="danger" data-testid={`close-${account.id}`}>
                      Close account
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>

          <div class="support-bar">
            <p class="support-bar-title">Trouble with an account?</p>
            <p>
              Our primate advisors are available every day, 6am to midnight.{' '}
              <a href="/settings">Talk to a human</a>.
            </p>
          </div>
        </section>
      </div>
    </Layout>,
  )
})

settings.post('/accounts/:id/archive', (c) => {
  const user = c.get('user')
  const account = findAccount(c.req.param('id'))
  if (!account || account.userId !== user.id) return c.notFound()
  archiveAccount(account.id)
  return c.redirect('/settings?closed=1')
})
