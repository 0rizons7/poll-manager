const socket = io();
let users = [];
let myIp = null;

socket.on("youAre", (ip) => {
    myIp = ip;
});

socket.on("updateUsers", (usersArray) => {
    users = usersArray;
    renderUsers();
});

function renderUsers() {
    const $usersList = $("#usersList");
    $usersList.empty();
    const now = Date.now();
    users.forEach(({ ip, connectedAt }) => {
        const secondsConnected = Math.floor((now - connectedAt) / 1000);
        const $li = $("<li>").text(`${ip} - connecté depuis ${secondsConnected} secondes`);

        if (ip === myIp) {
            $li.css("color", "#0000"+Math.min(Math.floor(secondsConnected/2), 255).toString(16));
            $li.css("font-weight", "bold");
        }

        $usersList.append($li);
    });
}

setInterval(renderUsers, 1000);
