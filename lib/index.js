/**
 * dsh-aemeath-theme host half: serves the packaged theme assets (pixel pet
 * sheet, backgrounds, 9-slice buttons, pixel font) to the browser half under
 * one prefix route. Everything visual lives in the client bundle.
 */
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

export const name = 'dsh-aemeath-theme'
export const inject = ['webServer']

export const ASSET_PREFIX = '/aemeath-theme/assets'
const ASSET_DIR = new URL('../assets/', import.meta.url)
const TYPES = { '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' }
const cache = new Map()

async function serveAsset(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return }
  const path = decodeURIComponent((req.url || '').split('?')[0])
  const file = path.startsWith(ASSET_PREFIX + '/') ? path.slice(ASSET_PREFIX.length + 1) : ''
  const ext = file.slice(file.lastIndexOf('.'))
  if (!/^[a-z0-9._-]+$/i.test(file) || file.includes('..') || !TYPES[ext]) { res.writeHead(404); res.end('not found'); return }
  let hit = cache.get(file)
  if (!hit) {
    let body
    try { body = await readFile(new URL(file, ASSET_DIR)) } catch { res.writeHead(404); res.end('not found'); return }
    hit = { body, etag: `"${body.length.toString(16)}-${createHash('sha1').update(body).digest('hex').slice(0, 12)}"` }
    cache.set(file, hit)
  }
  const headers = { 'content-type': TYPES[ext], 'cache-control': 'public, max-age=86400', etag: hit.etag, 'access-control-allow-origin': '*' }
  if (req.headers['if-none-match'] === hit.etag) { res.writeHead(304, headers); res.end(); return }
  res.writeHead(200, { ...headers, 'content-length': hit.body.length })
  res.end(req.method === 'HEAD' ? undefined : hit.body)
}

/**
 * Boot splash written straight into index.html, so the very first paint is
 * already the Aemeath night (plum background + pixel Aemeath) instead of the
 * stock desktop layout that shows for a moment while client plugins load.
 * The client sets html[data-aemeath-ready] once its layout has settled; a CSS
 * timeout hides the splash anyway after 12 s so a failed plugin never blocks.
 */
const SPLASH = `<style id="aemeath-boot-css">
html:not([data-aemeath-ready]){background:#0d091b;color-scheme:dark}
#aemeath-splash{position:fixed;inset:0;z-index:2147483600;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;
  background:radial-gradient(ellipse at 50% 35%,#2a1a4d 0%,#120d26 55%,#0d091b 100%);
  animation:ae-splash-timeout 0s linear 12s forwards;pointer-events:none}
html[data-aemeath-ready] #aemeath-splash{opacity:0;visibility:hidden;transition:opacity .25s steps(3),visibility 0s .25s}
#aemeath-splash i{width:96px;height:104px;background:url("${ASSET_PREFIX}/pet-half.webp") 0 0/768px 936px no-repeat;animation:ae-splash-run .9s steps(6) infinite;image-rendering:pixelated}
#aemeath-splash b{font:600 13px/1 ui-monospace,monospace;letter-spacing:3px;color:#ffb3da;text-shadow:0 0 8px #ff69b7}
@keyframes ae-splash-run{to{background-position:-576px 0}}
@keyframes ae-splash-timeout{to{opacity:0;visibility:hidden}}
</style>`
const SPLASH_BODY = '<div id="aemeath-splash" aria-hidden="true"><i></i><b>LOADING · 爱弥斯</b></div>'

function injectSplash(html) {
  if (html.includes('aemeath-boot-css')) return html
  let out = html.includes('</head>') ? html.replace('</head>', `${SPLASH}</head>`) : SPLASH + html
  out = /<body[^>]*>/.test(out) ? out.replace(/<body[^>]*>/, (m) => m + SPLASH_BODY) : out + SPLASH_BODY
  return out
}

export function apply(ctx) {
  const webServer = ctx.get('webServer')
  ctx.effect(() => webServer.register({ kind: 'prefix', path: ASSET_PREFIX, handler: serveAsset }), 'dsh-aemeath-theme: asset route')
  if (typeof webServer.tapIndex === 'function') ctx.effect(() => webServer.tapIndex(injectSplash), 'dsh-aemeath-theme: boot splash')
}
