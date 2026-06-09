import { createServer } from 'http';
import app from './app.js';
import { initWebSocket } from './ws/index.js';
import { cleanupExpiredHooks } from './db/index.js';

const PORT = process.env.PORT || 8080;

const server = createServer(app);

initWebSocket(server);

// Cleanup expired hooks every hour
setInterval(() => {
  cleanupExpiredHooks();
}, 60 * 60 * 1000);

server.listen(PORT, () => {
  console.log(`Hook server running on port ${PORT}`);
  cleanupExpiredHooks(); // Clean on start
});