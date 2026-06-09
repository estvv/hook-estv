import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

let wss: WebSocketServer;

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  console.log('WebSocket server initialized');
}

export function broadcastRequest(data: any) {
  if (!wss) {
    return;
  }
  
  const message = JSON.stringify({
    type: 'request:received',
    data
  });
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}