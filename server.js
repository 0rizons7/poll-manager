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

const connectedUsers = new Map();
//ip : {
//socketId
//connectedAt
//tokenPos : [0<x<1, 0<y<1] 
//TODO - Add a token by user

app.use(express.static("public"));

io.on("connection", (socket) => {
    const forwarded = socket.handshake.headers["x-forwarded-for"];
    const userIP =
    typeof forwarded === "string"
        ? forwarded.split(",")[0]
        : Array.isArray(forwarded)
        ? forwarded[0]
        : socket.handshake.address;

    connectedUsers.set(userIP, {
        socketId: socket.id,
        connectedAt: Date.now(),
    });
    socket.emit("youAre", userIP);

    broadcastUsers();

    console.log(
        `Un utilisateur avec l'IP ${userIP} s'est connecté. Total: ${connectedUsers.size}`
    );

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
