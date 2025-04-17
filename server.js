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
  
    connectedUsers.set(userIP, socket.id);
    io.emit("updateUsers", Array.from(connectedUsers.keys()));
  
    console.log(`Un utilisateur avec l'IP ${userIP} s'est connecté. Total: ${connectedUsers.size}`);
  
    socket.on("disconnect", () => {
        connectedUsers.delete(userIP);
        io.emit("updateUsers", Array.from(connectedUsers.keys()));
        console.log(`Un utilisateur avec l'IP ${userIP} s'est déconnecté. Total: ${connectedUsers.size}`);
    });
  });
  
server.listen(8080, () => {
    console.log("Serveur démarré sur http://localhost:8080");
});
