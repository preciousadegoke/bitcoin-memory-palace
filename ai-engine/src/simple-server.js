const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        status: '🧠 Bitcoin AI Engine Working!', 
        path: req.url 
    }));
});

server.listen(3001, 'localhost', () => {
    console.log('🚀 Simple server running on http://localhost:3001');
});