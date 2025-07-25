const socket = io();

let savedUsers = new Object();

socket.on("sendingUsers", (users) => {
    console.log("You are " + socket.id)
    savedUsers = JSON.parse(users);
    onIdentified();
});

socket.on("updateUsers", (updatedUsers) => {
    const savedIDs = Array.from(Object.keys(savedUsers));
    const updatedIDs = Array.from(Object.keys(JSON.parse(updatedUsers)));

    const usersToRemove = savedIDs.filter(id => !updatedIDs.includes(id));
    const usersToAdd = updatedIDs.filter(id => !savedIDs.includes(id));

    console.log("Users to remove: ", usersToRemove);
    console.log("Users to add: ", usersToAdd);

    usersToRemove.forEach(id => {
        $(`#${id}`).remove()
    });
    usersToAdd.forEach(id => {
        $("body").append(`<div id="${id}" class="token others" style="left: 50%; top: 50%;"></div>`);
    });

    savedUsers = JSON.parse(updatedUsers);
});

socket.on("updatePosition", (id, position) => {
    console.log(position);
    console.log(`Updating position for user ${id} to (${position.x}, ${position.y})`);
    $(`#${id}`).css({left: `${position.x}%`, top: `${position.y}%` })
});

function onIdentified() {
    for (const [id, position] of Object.entries(savedUsers)) {
        console.log(`Adding user ${id} at position ${position.x}, ${position.y}`);
        $("body").append(`<div id="${id}" class="token" style="left: ${position.x}%; top: ${position.y}%;"></div>`);
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
        },
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

// this function is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener