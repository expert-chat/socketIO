// Store userId as key and details including socketId and timeout ID
const users = {};

export default function registerEvents(socket, io) {
    // Parse the user JSON data from the query params
    const user = JSON.parse(socket?.handshake?.query?.user);

    if (user?.id) {
        // Check if the user is already in the users object
        if (users[user.id] && users[user.id].disconnectTimeout) {
            // Clear any pending disconnection if the user reconnects within 5 seconds
            clearTimeout(users[user.id].disconnectTimeout);
            console.log(`User ${user.name} reconnected. Cancelled disconnect timeout.`);
        }

        // Store or update the user's socketId and clear disconnectTimeout
        users[user.id] = {
            socketId: socket.id,
            disconnectTimeout: null,
        };

        const message = `User (${user.name}) connected with socket ID: (${socket.id})`;
        console.log(message);

        socket.broadcast.emit('userConnected', message);
    }

    socket.on('saveParticipants', (participants) => {
        const authId = user?.id;

        // Check if the user exists in the users object
        if (authId && users[authId] && users[authId].socketId) {
            console.log("=============================");
            console.log(`Checking online status for participants:`);
            console.log("=============================");

            // Filter out the online participants
            const onlineParticipants = participants.filter(participant => {
                return users[participant] && users[participant].socketId; // Check if user is online
            });

            console.log(`Online participants:`, onlineParticipants);

            // Emit only online participants back to the client
            socket.emit('onlineParticipants', onlineParticipants);  // Emit back only the online participants
        }
    });


    socket.on('sendMessage', (data) => {
        console.dir({data});
    });


    // Handle user disconnection with a delay
    socket.on('disconnect', () => {
        if (user?.id && users[user.id]) {
            users[user.id].disconnectTimeout = setTimeout(() => {
                console.log(`User ${user.id} disconnected (Socket ID: ${socket.id}) after delay.`);
                socket.broadcast.emit('userDisconnected', `User with ID: (${user.id}) has disconnected.`);
                delete users[user.id];
            }, 5000);
        }
    });
}

