import express from 'express';
import http from 'http';
import socketInit from './socket/index.js';
import logger from './utils/logger.js';
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file
const app = express();
const index = http.createServer(app);

app.get('/', (req, res) => {
    res.send('Node.js app is running!');
});


socketInit(index); // Initialize Socket.IO with server

const PORT = process.env.PORT || 6000;
index.listen(PORT, () => logger.info(`Server running on port http://localhost:${PORT}`));
