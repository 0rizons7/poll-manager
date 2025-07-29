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
let pollData = {"option1": {
                            "votes": 0,
                            "percent": 50
                }, 
                "option2": {
                            "votes": 0,
                            "percent": 50
                }};

io.on("connection", (socket) => {
    connectedUsers[socket.id] = {x:50, y:50, vote: null};
    console.log(connectedUsers);

    socket.broadcast.emit("updateUsers", JSON.stringify(connectedUsers));

    socket.emit("sendingUsers", JSON.stringify(connectedUsers), JSON.stringify(pollData));

    console.log(`Un nouveau socket ${socket.id} a été créé. Total de sockets : ${Object.keys(connectedUsers).length}`);

    socket.on("tokenMoved", (x, y) => {
        connectedUsers[socket.id] = {x: x, y: y};
        socket.broadcast.emit("updatePosition", socket.id, connectedUsers[socket.id]);
    });

    socket.on("tokenDropped", (oldVote, newVote) => {
        if (oldVote !== null) {
            pollData[oldVote].votes -= 1;
        }
        pollData[newVote].votes += 1;
        totalVotes = pollData["option1"].votes + pollData["option2"].votes;

        for (const option in pollData) {
            pollData[option].percent = Math.round((pollData[option].votes / totalVotes) * 100);
        }

        connectedUsers[socket.id].vote = newVote;
        io.emit("updateVotes", JSON.stringify(pollData), JSON.stringify(connectedUsers));
    })

    socket.on("disconnect", () => {
        delete connectedUsers[socket.id];
        socket.broadcast.emit("updateUsers", JSON.stringify(connectedUsers));
        console.log(`Le socket ${socket.id} a été déconnecté. Total de sockets : ${Object.keys(connectedUsers).length}`);
    });

});

server.listen(8080, () => {
    console.log("Serveur démarré sur http://localhost:8080");
});
