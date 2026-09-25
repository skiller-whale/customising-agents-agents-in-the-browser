import { Hono } from 'hono'
import { Layout } from '../views/Layout.tsx'
import { logIn, logOut, currentUser } from '../auth.ts'
import { findUserByEmail } from '../store.ts'

export const login = new Hono()

function LoginPage({ error, email }: { error?: string; email?: string }) {
  return (
    <Layout title="Log in">
      <div class="narrow">
        <h1>Log in</h1>
        <p class="lede">Welcome back. Your money is exactly where you left it, probably.</p>

        {error ? (
          <p class="alert" role="alert" data-testid="login-error">
            {error}
          </p>
        ) : null}

        <form method="post" action="/login" class="stack">
          <div class="field">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" value={email ?? ''} required autocomplete="username" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required autocomplete="current-password" />
          </div>
          <button type="submit" class="primary" data-testid="log-in">
            Log in
          </button>
        </form>
      </div>
    </Layout>
  )
}

login.get('/login', (c) => {
  if (currentUser(c)) return c.redirect('/')
  return c.html(<LoginPage />)
})

login.post('/login', async (c) => {
  const form = await c.req.parseBody()
  const email = String(form.email ?? '')
  const password = String(form.password ?? '')
  const user = findUserByEmail(email)

  if (!user || user.password !== password) {
    c.status(401)
    return c.html(<LoginPage error="Those details don't match any account." email={email} />)
  }

  logIn(c, user)
  return c.redirect('/')
})

login.post('/logout', (c) => {
  logOut(c)
  return c.redirect('/login')
})
