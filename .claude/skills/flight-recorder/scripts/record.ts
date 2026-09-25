/**
 * Records one step of a browser run.
 *
 *   node .claude/skills/flight-recorder/scripts/record.ts <run-id> <screenshot> "<note>"
 *
 * Files the screenshot under runs/<run-id>/, appends to that run's steps.jsonl,
 * and rebuilds the HTML report. The agent never writes JSON by hand, so the log
 * is always valid.
 */
import { appendFileSync, existsSync, mkdirSync, renameSync } from 'node:fs'
import { basename, join } from 'node:path'
import { RUNS_DIR, readRun } from './runs.ts'
import { buildReport } from './build-report.ts'

const [runId, screenshot, ...rest] = process.argv.slice(2)

function fail(message: string): never {
  console.error(`record: ${message}`)
  console.error('usage: node .claude/skills/flight-recorder/scripts/record.ts <run-id> <screenshot-file> "<note>"')
  process.exit(1)
}

if (!runId) fail('missing run id')
if (!/^[\w.-]+$/.test(runId)) fail(`run id "${runId}" must be letters, numbers, dots, dashes or underscores`)
if (!screenshot) fail('missing screenshot file')

const note = rest.join(' ').trim()
if (!note) fail('missing note — describe what this step did, in one line')

const runDir = join(RUNS_DIR, runId)
mkdirSync(runDir, { recursive: true })

// Move the file the browser wrote into this run's directory.
const file = basename(screenshot)
const destination = join(runDir, file)
if (!existsSync(destination)) {
  if (!existsSync(screenshot)) fail(`no such file: ${screenshot}`)
  renameSync(screenshot, destination)
}

const n = readRun(runId).steps.length + 1
const step = { n, file, note, ts: new Date().toISOString() }
appendFileSync(join(runDir, 'steps.jsonl'), `${JSON.stringify(step)}\n`)

buildReport()
console.log(`Recorded step ${n} of run ${runId}: ${note}`)
console.log(`Report: http://localhost:3004/${runId}/`)
