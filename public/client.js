const socket = io();

socket.on("updateUsers", (users) => {
    const $usersList = $("#usersList");
    $usersList.empty(); 
    users.forEach((ip) => {
        $usersList.append($("<li>").text(ip));
    });
    $("body")
});