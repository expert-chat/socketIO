const users = new Map();

export default function registerEvents(socket, io) {

    const user = JSON.parse(socket?.handshake?.query?.user);

    if (user?.id) {
        if (users.has(user.id)) {
            const existingUser = users.get(user.id);
            if (existingUser.disconnectTimeout) {
                clearTimeout(existingUser.disconnectTimeout);
                console.log(`User ${user.name} reconnected. Cancelled disconnect timeout.`);
            }
        }

        users.set(user.id, {
            socketId: socket.id,
            disconnectTimeout: null,
        });

        console.log(`User (${user.name}) connected with socket ID: (${socket.id})`);
        socket.broadcast.emit('userConnected', `User (${user.name}) connected.`);
    }

    socket.on('setParticipants', (participants) => {
        const authId = user?.id;

        if (authId && users.has(authId)) {
            const onlineParticipants = participants.filter(participant => users.has(participant));
            console.log(`Online participants:`, onlineParticipants);
            socket.emit('onlineParticipants', onlineParticipants);
        }
    });

    socket.on('disconnect', () => {
        if (user?.id && users.has(user.id)) {
            const disconnectTimeout = setTimeout(() => {
                console.log(`User ${user.id} disconnected (Socket ID: ${socket.id}) after delay.`);
                socket.broadcast.emit('userDisconnected', `User (${user.id}) disconnected.`);
                users.delete(user.id);
            }, 5000);

            users.set(user.id, {...users.get(user.id), disconnectTimeout});
        }
    });
}
