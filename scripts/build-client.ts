import * as esbuild from 'esbuild'

const options: esbuild.BuildOptions = {
  entryPoints: ['app/client/dashboard.ts', 'app/client/transfer.ts'],
  outdir: 'app/server/public/js',
  bundle: true,
  format: 'esm',
  target: 'es2022',
  logLevel: 'info',
}

if (process.argv.includes('--watch')) {
  const context = await esbuild.context(options)
  await context.watch()
  console.log('Watching client scripts...')
} else {
  await esbuild.build(options)
}
