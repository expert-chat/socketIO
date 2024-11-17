export default function registerEvents(socket, io, users, user) {

    // get my online participants
    socket.on('getOnlineParticipants', (participants) => {
        const authId = user?.id;
        if (authId && users.has(authId)) {
            const onlineParticipants = participants.filter(participant => users.has(participant));
            socket.emit('onlineParticipants', onlineParticipants);
        }
    });


    // send message to others
    socket.on('messageSent', (message, chat) => {
        const authId = user?.id;
        const participants = chat?.participants;

        if (authId && users.has(authId) && Array.isArray(participants)) {

            /* send to participants */
            participants.forEach((participant) => {
                if (participant && users.has(participant.id)) {
                    const targetSocket = users.get(participant.id);
                    if (targetSocket["socketId"]) {
                        socket.to(targetSocket["socketId"]).emit('haveNewMessage', message, chat);
                    }
                }
            });

        } else {
            console.error("empty Participants");
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
