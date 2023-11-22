document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chatBox");
  const userDisplay = document.getElementById("user");
  const messagesLogs = document.getElementById("messagesLogs");

  const setUsername = async () => {
    const { value: username } = await Swal.fire({
      title: "Autentication",
      input: "text",
      text: "Set your username",
      inputValidator: (value) =>
        !value.trim() && "Please, choose a valid username",
      allowOutsideClick: false,
    });

    userDisplay.innerHTML = `<b>${username}: </b>`;
    return username;
  };

  const initSocket = (username) => {
    const socket = io();

    chatBox.addEventListener("keyup", (event) => {
      if (event.key === "Enter" && chatBox.value.trim().length > 0) {
        const newMessage = { user: username, message: chatBox.value };
        socket.emit("message", newMessage);
        chatBox.value = "";
      }
    });

    socket.on("logs", (data) => {
      const messagesHTML = data
        .reverse()
        .map(({ user, message }) => {
          return `<div class='p-1.5'>
            <p><i class='text-blue-400 font-semibold'>${user}:</i> ${message}</p>
          </div>`;
        })
        .join("");

      messagesLogs.innerHTML = messagesHTML;
    });
  };

  setUsername().then(initSocket);
});
