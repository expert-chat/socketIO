export default function registerEvents(socket, io, users, user) {

    socket.on('iamOnline', () => {
        console.log(`Connected:(${user.name}) connected with socket ID: (${socket.id})`);
        socket.broadcast.emit('userConnected', `User (${user.name}) connected.`);
    });

    socket.on('getOnlineParticipants', (participants) => {
        const authId = user?.id;

        if (authId && users.has(authId)) {
            const onlineParticipants = participants.filter(participant => users.has(participant));
            console.log(`Online participants:`, onlineParticipants);
            socket.emit('onlineParticipants', onlineParticipants);
        }
    });

    socket.on('disconnect', () => {
        if (user?.id && users.has(user.id)) {
            console.log(`Disconnected: ${user.id}`);
            socket.broadcast.emit('offline', user);
            users.delete(user.id);
        }
    });

}
