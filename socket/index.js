import { Server } from 'socket.io';
import registerEvents from './events.js';
import { authenticate } from './middleware.js';

export default function socketInit(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",  // Allow all origins; adjust for production
            methods: ["GET", "POST"]
        }
    });

    io.use(authenticate); // Apply middleware

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);
        registerEvents(socket, io); // Register events
    });

    io.on('disconnect', (socket) => {
        console.log(`User disconnected: ${socket.id}`);
    });
}
