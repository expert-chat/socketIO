import express from 'express';
import http from 'http';
import socketInit from './socket/index.js';
import logger from './utils/logger.js';
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file
const app = express();
const server = http.createServer(app);

socketInit(server); // Initialize Socket.IO with server

const PORT = process.env.PORT || 6000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
