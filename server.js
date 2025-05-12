const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

let connectedUsers = new Map();

app.use(express.static("public"));

io.on("connection", (socket) => {
    const forwarded = socket.handshake.headers["x-forwarded-for"];
    const userIP = forwarded ? forwarded.split(",")[0] : socket.handshake.address; 
  
    connectedUsers.set(userIP, {
        socketId: socket.id,
        connectedAt: Date.now(),
    });
    socket.emit("youAre", userIP);

    broadcastUsers();

    console.log(`Un utilisateur avec l'IP ${userIP} s'est connecté. Total: ${connectedUsers.size}`);
  
    socket.on("disconnect", () => {
        connectedUsers.delete(userIP);
        broadcastUsers();
    });
});

function broadcastUsers() {
    const usersArray = Array.from(connectedUsers.entries()).map(([ip, data]) => ({
        ip,
        connectedAt: data.connectedAt,
    }));
    io.emit("updateUsers", usersArray);
}

  
server.listen(8080, () => {
    console.log("Serveur démarré sur http://localhost:8080");
});
