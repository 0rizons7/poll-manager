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
    const usersList = $("#usersList");

    usersList.text("")

    const now = Date.now();

    users.forEach(({ ip, connectedAt }) => {
    const secondsConnected = Math.floor((now - connectedAt) / 1000);

    const li = $("<li></li>").text(`${ip} - connecté depuis ${secondsConnected} secondes`)

    if (ip === myIp) {
        li.addClass("you")
    }

    usersList.append(li);
    });
}

window.addEventListener("DOMContentLoaded", () => {
    interact('.token').draggable({
        inertia: true,
        listeners: {
            move : dragMoveListener,
        },
    })

    setInterval(renderUsers, 1000);
});

function dragMoveListener (event) {
    const target = event.target
    
    let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

    target.style.transform  = 'translate(' + x + 'px, ' + y + 'px)'

    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
}