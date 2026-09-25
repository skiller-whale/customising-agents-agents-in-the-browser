/**
 * Serves the run reports so you can see what the headless browser saw.
 *   npm run reports   →   http://localhost:1004/
 */
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { RUNS_DIR } from './runs.ts'
import { buildReport } from './build-report.ts'

const PORT = Number(process.env.REPORTS_PORT ?? 1004)

// So there is something to look at before the first run is recorded.
buildReport()

// Only what a report is made of. Anything else in runs/ is not served.
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jsonl': 'text/plain; charset=utf-8',
}

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost')
  // Strip any ../ before it can escape the runs directory.
  const relative = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
  let path = join(RUNS_DIR, relative)

  if (existsSync(path) && statSync(path).isDirectory()) {
    path = join(path, 'index.html')
  }

  const type = TYPES[extname(path)]
  if (!type || !existsSync(path)) {
    response.writeHead(404, { 'Content-Type': 'text/plain' })
    response.end('Not found. Have you recorded a run yet?')
    return
  }

  response.writeHead(200, {
    'Content-Type': type,
    'Content-Length': statSync(path).size,
    // Reports change while a run is in progress; never serve a stale one.
    'Cache-Control': 'no-store',
  })
  createReadStream(path).pipe(response)
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Run reports on http://localhost:${PORT}`)
})
