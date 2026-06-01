import http from 'node:http';
import app from './app.js';
import connectDB from './config/db.js';
import { initializeSocket } from './config/socket.js';

const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`API and Socket.io server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
