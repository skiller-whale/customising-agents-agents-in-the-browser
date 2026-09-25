import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

/** runs/ at the project root: this file lives in .claude/skills/flight-recorder/scripts/. */
export const RUNS_DIR = resolve(import.meta.dirname, '../../../../runs')

export type Step = {
  n: number
  file: string
  note: string
  ts: string
}

export type Run = {
  id: string
  steps: Step[]
}

/** Reads one run's steps.jsonl. Bad lines are skipped rather than fatal. */
export function readRun(id: string): Run {
  const path = join(RUNS_DIR, id, 'steps.jsonl')
  const steps = existsSync(path)
    ? readFileSync(path, 'utf8')
        .split('\n')
        .filter((line) => line.trim() !== '')
        .flatMap((line) => {
          try {
            return [JSON.parse(line) as Step]
          } catch {
            console.warn(`Skipping unreadable line in ${path}`)
            return []
          }
        })
    : []

  return { id, steps }
}

/** Every run directory, newest first (ids start with a sortable timestamp). */
export function listRunIds(): string[] {
  if (!existsSync(RUNS_DIR)) return []
  return readdirSync(RUNS_DIR, { withFileTypes: true })
    // Skip dot-directories: the browser drops its own scratch files in
    // runs/.artifacts, and that is not a run anyone wants to look at.
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort()
    .reverse()
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** An ISO timestamp in this machine's local time: "2026-09-18 13:28:05". */
export function localTime(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
