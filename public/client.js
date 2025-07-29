const socket = io();

let cachedUsers = new Object();
let cachedPollData = new Object()

socket.on("sendingUsers", (users, pollData) => {
    console.log("You are " + socket.id)
    cachedUsers = JSON.parse(users);
    cachedPollData = JSON.parse(pollData);
    onIdentified();
});

socket.on("updateUsers", (updatedUsers) => {
    const parsedUpdatedUsers = JSON.parse(updatedUsers);

    const cachedIDs = Array.from(Object.keys(cachedUsers));
    const updatedIDs = Array.from(Object.keys(parsedUpdatedUsers));

    const usersToAdd = updatedIDs.filter(id => !cachedIDs.includes(id));
    const usersToRemove = cachedIDs.filter(id => !updatedIDs.includes(id));
    
    usersToRemove.forEach(id => {
        $(`#${id}`).remove()
    });
    usersToAdd.forEach(id => {
        $("body").append(`<div id="${id}" class="token others" style="left: 48.5vw; top: 50vh;"></div>`);
    });

    cacheUsers = parsedUpdatedUsers;
});

socket.on("updateVotes", (updatedPollData, updatedUsers) => {
    cachedPollData = JSON.parse(updatedPollData);
    cachedUsers = JSON.parse(updatedUsers);
    for (const [option, data] of Object.entries(cachedPollData)) {
        $(`#${option} .choice__percent`).text(data.percent + "%");
        $(`#${option} .choice__votes`).text(data.votes + (data.votes > 1 ? " votes" : " vote"));
        $("#" + option).css("width", data.percent+"%");
    }
});

socket.on("updatePosition", (id, position) => {
    $(`#${id}`).css({left: `${position.x}%`, top: `${position.y}%` })
});

function onIdentified() {
    console.log(cachedPollData)
    console.log(cachedUsers)
    
    for (const [id, position] of Object.entries(cachedUsers)) {
        console.log(`Adding user ${id} at position ${position.x}, ${position.y}`);
        $("body").append(`<div id="${id}" class="token" style="left: ${position.x-1.5}vw; top: ${position.y}vh;"></div>`);
        $(`#${id}`).addClass(id === socket.id? "you" : "others");
    }

    interact("#"+socket.id).draggable({
        inertia: true,
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: 'parent',
                endOnly: true
            })
        ], 
        listeners: {
            move : dragMoveListener,
            end : dragEndListener
        }
    });
};

function dragMoveListener (event) {
  var target = event.target
  // keep the dragged position in the data-x/data-y attributes
  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

  // translate the element
  target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

  // update the position attributes
  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)

  const rect = target.getBoundingClientRect();
  socket.emit("tokenMoved", rect.left / window.innerWidth * 100, rect.top / window.innerHeight * 100);
}

function dragEndListener(event){
    const rect = event.target.getBoundingClientRect();
    const newVote = rect.left < $("#option1").width() ? "option1" : "option2"
    if (newVote !== cachedUsers[socket.id].vote) {
        socket.emit("tokenDropped", cachedUsers[socket.id].vote, newVote);
    }
};