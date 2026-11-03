// Bundle src/client/*.js + vendored client bundles into lib/client.js in the
// harness `window.__ModuleLoader__.load({id, factory})` format (CommonJS
// module table + local require, same shape as dsh-mobile-nav), and copy the
// host entry to lib/index.js.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const mods = {}
for (const f of readdirSync(join(root, 'src/client'))) if (f.endsWith('.js')) mods[f] = readFileSync(join(root, 'src/client', f), 'utf8')

// vendored plugin bundles: turn `window.__ModuleLoader__.load({...})` into a
// module that exports the {id, factory} spec instead of registering it.
const vendors = {
  'vendor/mobile-nav.js': 'mobile-nav.client.js',
  'vendor/header-fix.js': 'dsh-mobile-header-fix.client.js',
  'vendor/touch-fix.js': 'dsh-mobile-touch-fix.client.js',
  'vendor/wallpaper-layout.js': 'dsh-wallpaper-engine-mobile-layout.client.js',
}
for (const [key, file] of Object.entries(vendors)) {
  let src = readFileSync(join(root, 'vendor', file), 'utf8')
  const before = src
  src = src.replace(/window\.__ModuleLoader__\.load\(/, 'module.exports = (')
  if (src === before) throw new Error('vendor wrapper not found in ' + file)
  mods[key] = src
}

let out = `/* ${pkg.name} ${pkg.version} — built ${new Date().toISOString()} */\n`
out += `window.__ModuleLoader__.load({id: ${JSON.stringify(pkg.name)}, factory: (require) => {\nconst modules = Object.create(null);\n`
for (const [k, src] of Object.entries(mods)) {
  out += `modules[${JSON.stringify(k)}] = function(require, module, exports) {\n${src}\n};\n`
}
out += `
const cache = Object.create(null);
function load(key) {
  if (cache[key]) return cache[key].exports;
  if (!modules[key]) throw new Error('Unknown aemeath-theme module: ' + key);
  const module = cache[key] = { exports: {} };
  const localRequire = id => {
    if (!id.startsWith('.')) return require(id);
    const parts = key.split('/');
    parts.pop();
    for (const part of id.split('/')) {
      if (part === '..') parts.pop();
      else if (part !== '.') parts.push(part);
    }
    return load(parts.join('/'));
  };
  modules[key](localRequire, module, module.exports);
  return module.exports;
}
const entry = load('index.js');
entry.apply.require = require;
return entry;
}});
`
mkdirSync(join(root, 'lib'), { recursive: true })
writeFileSync(join(root, 'lib/client.js'), out)
writeFileSync(join(root, 'lib/index.js'), readFileSync(join(root, 'src/host/index.js')))
console.log('lib/client.js', out.length, 'bytes;', Object.keys(mods).length, 'modules')
