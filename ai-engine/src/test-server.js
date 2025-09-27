const http = require('http');

console.log('Starting server...');

const server = http.createServer((req, res) => {
    console.log('Request received:', req.url);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bitcoin AI Engine Working!');
});

server.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
