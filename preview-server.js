// Zero-dependency static file server for LOCAL PREVIEW only.
// Production deployment should use server.js (Express) which also handles form submissions.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  if (urlPath.endsWith('/')) urlPath += 'index.html';

  const filePath = path.join(ROOT, urlPath);

  // prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // try with .html extension if no extension
      if (!path.extname(filePath)) {
        return fs.readFile(filePath + '.html', (err2, data2) => {
          if (err2) { res.writeHead(404); return res.end('Not found'); }
          res.writeHead(200, { 'Content-Type': MIME['.html'] });
          res.end(data2);
        });
      }
      res.writeHead(404); return res.end('Not found');
    }
    const mime = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`[preview] serving ${ROOT} on http://localhost:${PORT}`);
});
