import { createHmac, timingSafeEqual } from 'node:crypto'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import type { Context, MiddlewareHandler } from 'hono'
import { findUserById } from './store.ts'
import type { User } from './types.ts'

/**
 * Toy session handling: a signed cookie holding the user id. Good enough for a
 * demo app, and — importantly for the workshop — stateless, so a saved browser
 * session survives a server restart or a data reset.
 */
const SECRET = process.env.SESSION_SECRET ?? 'a-fish-called-wanda'
const COOKIE = 'fintech_session'

function sign(userId: string): string {
  return createHmac('sha256', SECRET).update(userId).digest('hex')
}

function verify(value: string): string | null {
  const [userId, signature] = value.split('.')
  if (!userId || !signature) return null
  const expected = sign(userId)
  if (signature.length !== expected.length) return null
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null
  return userId
}

export function logIn(c: Context, user: User): void {
  setCookie(c, COOKIE, `${user.id}.${sign(user.id)}`, { path: '/', httpOnly: true, sameSite: 'Lax' })
}

export function logOut(c: Context): void {
  deleteCookie(c, COOKIE, { path: '/' })
}

export function currentUser(c: Context): User | null {
  const cookie = getCookie(c, COOKIE)
  if (!cookie) return null
  const userId = verify(cookie)
  return userId ? (findUserById(userId) ?? null) : null
}

export type Vars = { Variables: { user: User } }

/** Redirects to the login page if nobody is signed in. */
export const requireUser: MiddlewareHandler<Vars> = async (c, next) => {
  const user = currentUser(c)
  if (!user) return c.redirect('/login')
  c.set('user', user)
  await next()
}
