import type { Child } from 'hono/jsx'
import type { User } from '../types.ts'

type Props = {
  title: string
  user?: User | null
  script?: string
  children: Child
}

export function Layout({ title, user, script, children }: Props) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title} · FinTech</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="/css/app.css" />
        {script ? <script type="module" src={script} defer></script> : null}
      </head>
      <body>
        <header class="site-header">
          <a class="brand" href="/">
            <span class="brand-mark" aria-hidden="true">
              🐟
            </span>
            <span>
              Fin<strong>Tech</strong>
            </span>
          </a>
          {user ? (
            <nav aria-label="Main">
              <a href="/">Dashboard</a>
              <a href="/transfer">Transfer</a>
              <a href="/settings">Settings</a>
              <form method="post" action="/logout">
                <button type="submit" class="link-button" data-testid="log-out">
                  Log out
                </button>
              </form>
            </nav>
          ) : null}
        </header>
        <main>{children}</main>
        <footer class="site-footer">
          <p>FinTech — banking for fish. Deposits guaranteed up to one bucket.</p>
        </footer>
      </body>
    </html>
  )
}
