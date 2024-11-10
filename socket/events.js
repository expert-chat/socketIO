export default function registerEvents(socket, io) {
    socket.on('message', (data) => {
        console.log(`Message from ${socket.id}: ${data}`);
        io.emit('message', data); // Broadcast to all clients
    });

    socket.on('joinRoom', (room) => {
        socket.join(room);
        socket.to(room).emit('notification', `User ${socket.id} joined room ${room}`);
    });

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected`);
    });
}
