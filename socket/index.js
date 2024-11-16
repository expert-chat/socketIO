import { Server } from 'socket.io';
import registerEvents from './events.js';
import { authenticate } from './middleware.js';

const users = new Map();


export default function socketInit(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.use(authenticate);

    io.on('connection', (socket) => {

        const user = JSON.parse(socket?.handshake?.query?.user);

        if (user?.id) {
            users.set(user.id, {socketId: socket.id});
            socket.broadcast.emit('online', user);
        }

        registerEvents(socket, io, users, user); // Register events
    });

    io.on('disconnect', (socket) => {
        console.log(`User disconnected: ${socket.id}`);
    });
}
