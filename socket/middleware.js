export function authenticate(socket, next) {
    const token = socket.handshake.auth.token;
    if (isValidToken(token)) {
        return next();
    }
    return next(new Error("Unauthorized"));
}

function isValidToken(token) {
    return token == process.env.SOCKET_IO_TOKEN;
}
