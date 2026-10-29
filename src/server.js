require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1';

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
});

server.on('close', () => {
  console.log('Server has been stopped.');
});