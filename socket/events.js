export default function registerEvents(socket, io, users, user) {
    const emitEventToParticipants = (participants, eventName, ...args) => {
        if (!Array.isArray(participants)) {
            console.error("Participants must be an array.");
            return;
        }

        participants.forEach((participant) => {
            if (participant?.id && users.has(participant.id)) {
                const targetSocket = users.get(participant.id);
                const targetSocketId = targetSocket?.socketId;

                if (targetSocketId) {
                    socket.to(targetSocketId).emit(eventName, ...args);
                }
            }
        });
    };

    // Get online participants
    socket.on('getOnlineParticipants', (participants) => {
        const authId = user?.id;

        if (!authId || !users.has(authId)) {
            console.error("Unauthorized or invalid user.");
            return;
        }

        if (!Array.isArray(participants)) {
            console.error("Participants must be an array.");
            return;
        }

        const onlineParticipants = participants.filter(participant => users.has(participant));
        socket.emit('onlineParticipants', onlineParticipants);
    });

    // Send message to others
    socket.on('messageSent', (message, chat) => {
        if (!chat?.participants || !message) {
            console.error("Invalid chat or message.");
            return;
        }

        emitEventToParticipants(chat.participants, 'haveNewMessage', message, chat);
    });

    // Notify message read by
    socket.on('messageReadBy', (auth, message) => {
        const senderId = message?.sender?.id;

        if (!senderId || !users.has(senderId)) {
            console.error("Invalid sender or sender not found.");
            return;
        }

        const targetSocketId = users.get(senderId)?.socketId;
        if (targetSocketId) {
            socket.to(targetSocketId).emit('haveReadMessage', auth, message);
        }
    });

    // Notify last chat message read by
    socket.on('lastChatMessageReadBy', (auth, chat) => {
        if (!chat?.participants) {
            console.error("Invalid chat participants.");
            return;
        }

        emitEventToParticipants(chat.participants, 'haveLastChatMessageRead', auth, chat);
    });

    // Notify typing status
    socket.on('isTyping', (auth, chat) => {
        if (!chat?.participants) {
            console.error("Invalid chat participants.");
            return;
        }

        emitEventToParticipants(chat.participants, 'haveIsTyping', auth, chat);
    });

    // Notify stop typing status
    socket.on('isStopTyping', (auth, chat) => {
        if (!chat?.participants) {
            console.error("Invalid chat participants.");
            return;
        }

        emitEventToParticipants(chat.participants, 'haveStopIsTyping', auth, chat);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        if (user?.id && users.has(user.id)) {
            console.log(`User disconnected: ${user.id}`);
            users.delete(user.id);
            socket.broadcast.emit('offline', user);
        }
    });
}
