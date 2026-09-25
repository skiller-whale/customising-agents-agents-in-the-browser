/**
 * Turns recorded runs into static HTML you can open in a browser.
 *   node .claude/skills/flight-recorder/scripts/build-report.ts
 * Rebuilds everything from scratch each time, so it is safe to run repeatedly.
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { RUNS_DIR, escapeHtml, listRunIds, localTime, readRun, type Run } from './runs.ts'

const STYLE = `
  :root { color-scheme: light dark; }
  body { margin: 0; font: 16px/1.5 system-ui, sans-serif; background: #f2f7f9; color: #0f2733; }
  header { background: #075063; color: #fff; padding: 1rem 1.5rem; }
  header a { color: #cfe8f0; }
  h1 { margin: 0; font-size: 1.3rem; }
  main { max-width: 1000px; margin: 0 auto; padding: 1.5rem; }
  figure { margin: 0 0 2rem; background: #fff; border: 1px solid #d6e3e8; border-radius: 10px; overflow: hidden; }
  figure img { display: block; width: 100%; height: auto; border-bottom: 1px solid #d6e3e8; }
  figcaption { padding: 0.75rem 1rem; display: flex; align-items: baseline; gap: 0.5rem; flex-wrap: wrap; }
  .step-number { display: inline-block; min-width: 1.6rem; height: 1.6rem;
    border-radius: 999px; background: #0a6d8a; color: #fff; text-align: center; font-size: 0.85rem; line-height: 1.6rem; }
  .note { flex: 1; min-width: 12rem; }
  .time { color: #5b7180; font-size: 0.85rem; }
  ul { list-style: none; margin: 0; padding: 0; }
  li { margin-bottom: 0.5rem; background: #fff; border: 1px solid #d6e3e8; border-radius: 8px; padding: 0.75rem 1rem; }
  .empty { color: #5b7180; font-style: italic; }
`

function page(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${STYLE}</style>
</head>
<body>
<header><h1>${escapeHtml(title)}</h1></header>
<main>${body}</main>
</body>
</html>`
}

function runPage(run: Run): string {
  if (run.steps.length === 0) {
    return page(`Run: ${run.id}`, '<p class="empty">No steps recorded yet.</p>')
  }

  const steps = run.steps
    .map(
      (step) => `<figure>
  <img src="${escapeHtml(step.file)}" alt="Step ${step.n}: ${escapeHtml(step.note)}" loading="lazy">
  <figcaption>
    <span class="step-number">${step.n}</span>
    <span class="note">${escapeHtml(step.note)}</span>
    <span class="time">${escapeHtml(localTime(step.ts).slice(11))}</span>
  </figcaption>
</figure>`,
    )
    .join('\n')

  return page(`Run: ${run.id}`, `<p><a href="../">← All runs</a></p>${steps}`)
}

function indexPage(runs: Run[]): string {
  if (runs.length === 0) {
    return page('Browser runs', '<p class="empty">No runs recorded yet. Set an agent going and refresh.</p>')
  }
  const items = runs
    .map((run) => {
      const first = run.steps[0]
      const count = `${run.steps.length} step${run.steps.length === 1 ? '' : 's'}`
      const started = first ? `, first step recorded ${escapeHtml(localTime(first.ts))}` : ''
      return `<li><a href="${escapeHtml(run.id)}/">${escapeHtml(run.id)}</a> — ${count}${started}${
        first ? `<div class="time">${escapeHtml(first.note)}</div>` : ''
      }</li>`
    })
    .join('\n')
  return page('Browser runs', `<ul>${items}</ul>`)
}

export function buildReport(): void {
  const runs = listRunIds().map(readRun)
  for (const run of runs) {
    writeFileSync(join(RUNS_DIR, run.id, 'index.html'), runPage(run))
  }
  writeFileSync(join(RUNS_DIR, 'index.html'), indexPage(runs))
}

if (import.meta.filename === process.argv[1]) {
  buildReport()
  const count = listRunIds().length
  console.log(`Built reports for ${count} run${count === 1 ? '' : 's'} → http://localhost:1004/`)
}
