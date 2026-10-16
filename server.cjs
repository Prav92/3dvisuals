const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'out');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.glb': 'model/gltf-binary', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Bad request'); return; }
  const clean = pathname.replace(/\/+$/, '');
  const candidates = clean === '' ? ['/index.html'] : [clean, clean + '.html', clean + '/index.html'];
  const files = candidates.map((c) => path.resolve(root, '.' + c));
  if (files.some((f) => !f.startsWith(root + path.sep))) { res.writeHead(403).end(); return; }
  const tryNext = (i) => {
    if (i >= files.length) { console.log('404', req.method, req.url); res.writeHead(404).end('Not found'); return; }
    fs.stat(files[i], (statErr, stat) => {
      if (statErr || !stat.isFile()) { tryNext(i + 1); return; }
      fs.readFile(files[i], (err, data) => {
        if (err) { res.writeHead(404).end('Not found'); return; }
        res.setHeader('Content-Type', types[path.extname(files[i])] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.end(data);
      });
    });
  };
  tryNext(0);
}).listen(Number(process.env.PORT) || 4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:' + (Number(process.env.PORT) || 4173)));
