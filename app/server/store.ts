import * as seed from './seed.ts'
import type { Account, Transaction, User } from './types.ts'

/**
 * The whole database. It lives in memory, so restarting the server is the same
 * as resetting the data — which is what makes agent runs repeatable.
 */
let users: User[] = []
let accounts: Account[] = []
let transactions: Transaction[] = []
let nextId = 1000

export function reset(): void {
  users = structuredClone(seed.users)
  accounts = structuredClone(seed.accounts)
  transactions = structuredClone(seed.transactions)
  nextId = 1000
}

reset()

export function findUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
}

export function findUserById(id: string): User | undefined {
  return users.find((u) => u.id === id)
}

export function accountsFor(userId: string): Account[] {
  return accounts.filter((a) => a.userId === userId && !a.archived)
}

export function allAccountsFor(userId: string): Account[] {
  return accounts.filter((a) => a.userId === userId)
}

export function findAccount(id: string): Account | undefined {
  return accounts.find((a) => a.id === id)
}

export function transactionsFor(accountId: string): Transaction[] {
  return transactions
    .filter((t) => t.accountId === accountId)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function recentTransactionsFor(userId: string, limit = 8): Transaction[] {
  const ids = new Set(accountsFor(userId).map((a) => a.id))
  return transactions
    .filter((t) => ids.has(t.accountId))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
}

export function archiveAccount(id: string): void {
  const account = findAccount(id)
  if (account) account.archived = true
}

export type TransferResult =
  | { ok: true; transaction: Transaction }
  | { ok: false; error: string }

export function transfer(
  fromAccountId: string,
  toAccountId: string,
  amountMinor: number,
  reference: string,
): TransferResult {
  const from = findAccount(fromAccountId)
  const to = findAccount(toAccountId)
  if (!from) return { ok: false, error: `No account with id "${fromAccountId}"` }
  if (!to) return { ok: false, error: `No account with id "${toAccountId}"` }
  if (from.id === to.id) return { ok: false, error: 'Cannot transfer to the same account' }
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    return { ok: false, error: 'amountMinor must be a positive whole number of pence' }
  }
  if (from.balanceMinor < amountMinor) {
    return { ok: false, error: 'Insufficient funds' }
  }

  from.balanceMinor -= amountMinor
  to.balanceMinor += amountMinor
  const date = '2026-08-29'
  const outgoing: Transaction = {
    id: `t${nextId++}`,
    accountId: from.id,
    date,
    counterparty: reference || `Transfer to ${to.name}`,
    amountMinor: -amountMinor,
  }
  transactions.push(outgoing, {
    id: `t${nextId++}`,
    accountId: to.id,
    date,
    counterparty: reference || `Transfer from ${from.name}`,
    amountMinor,
  })
  return { ok: true, transaction: outgoing }
}
