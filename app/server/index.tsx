import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { login } from './routes/login.tsx'
import { dashboard } from './routes/dashboard.tsx'
import { transferRoutes } from './routes/transfer.tsx'
import { settings } from './routes/settings.tsx'
import { reset } from './store.ts'

const app = new Hono()

app.route('/', login)
app.route('/', transferRoutes)
app.route('/', settings)
app.route('/', dashboard)

/** A fish, so the browser stops asking for a favicon (and logging a 404). */
app.get('/favicon.svg', (c) => {
  c.header('Content-Type', 'image/svg+xml')
  c.header('Cache-Control', 'public, max-age=3600')
  return c.body(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#075063"/><path d="M6 16c4-6 12-6 16 0-4 6-12 6-16 0z" fill="#4fc3d9"/><path d="M22 16l5-4v8l-5-4z" fill="#4fc3d9"/><circle cx="12" cy="14.5" r="1.4" fill="#075063"/></svg>`,
  )
})

/** Resets all data to the seed state. The one-command reset for agent runs. */
app.post('/dev/reset', (c) => {
  reset()
  return c.json({ ok: true, message: 'Data reset to seed state.' })
})

app.use('/*', serveStatic({ root: './app/server/public' }))

const port = Number(process.env.PORT ?? 3002)

serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, (info) => {
  console.log(`FinTech is swimming on http://localhost:${info.port}`)
})
