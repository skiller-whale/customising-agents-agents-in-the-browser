export type User = {
  id: string
  email: string
  password: string
  name: string
  role: 'customer' | 'admin'
  species: string
}

export type Account = {
  id: string
  userId: string
  name: string
  type: 'current' | 'savings'
  balanceMinor: number
  archived: boolean
}

export type Transaction = {
  id: string
  accountId: string
  date: string
  counterparty: string
  /** Optional extra blurb shown under the counterparty name. May contain markup. */
  note?: string
  amountMinor: number
}
