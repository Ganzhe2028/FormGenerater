const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Hello');
});

server.on('error', (e) => {
  console.error('Server error code:', e.code);
  console.error('Server error message:', e.message);
});

try {
  server.listen(3005, '127.0.0.1', () => {
    console.log('Server running on 3005');
  });
} catch (e) {
  console.error('Sync startup error:', e);
}
