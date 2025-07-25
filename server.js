const express = require("express")
const http = require("http")
const {Server} = require("socket.io")

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(express.static("public"));

const connectedUsers = new Object();

io.on("connect", (socket) => {
    connectedUsers[socket.id] = {x:50, y:50};
    console.log(connectedUsers);

    socket.broadcast.emit("updateUsers", JSON.stringify(connectedUsers));

    socket.emit("sendingUsers", JSON.stringify(connectedUsers));

    console.log(`Un nouveau socket ${socket.id} a été créé. Total de sockets : ${Object.keys(connectedUsers).length}`);

    socket.on("tokenMoved", (x, y) => {
        connectedUsers[socket.id] = {x: x, y: y};
        socket.broadcast.emit("updatePosition", socket.id, connectedUsers[socket.id]);
    });

    socket.on("disconnect", () => {
        delete connectedUsers[socket.id];
        socket.broadcast.emit("updateUsers", JSON.stringify(connectedUsers));
        console.log(`Le socket ${socket.id} a été déconnecté. Total de sockets : ${Object.keys(connectedUsers).length}`);
    });

});

server.listen(8080, () => {
    console.log("Serveur démarré sur http://localhost:8080");
});
