const socket = new io("http://localhost:5000");

const apiUrl = "http://127.0.0.1:5000/api/message/send";

socket.on("connect", () => {
  console.log("Connected to Socket.IO server");

  socket.on("receive", (message) => {
    const recMessage = JSON.parse(message);
    displayMessage(recMessage);
  });
});

document.getElementById("send-button").addEventListener("click", async () => {
  const input = document.getElementById("message-input");
  const messageContent = input.value;
  const senderID = "Mohamed";
  const receiverID = "Youssef";

  try {
    const message = JSON.stringify({ senderID, receiverID, messageContent });
    socket.emit("send", message);
    displayMessage({ senderID, receiverID, messageContent });
    const response = await fetch(`${apiUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: message,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    input.value = "";

    const responseData = await response.json();
    console.log("Message sent:", responseData);
  } catch (error) {
    console.error("Error sending message:", error);
  }
});

function displayMessage(message) {
  const messagesDiv = document.getElementById("messages");
  const messageElement = document.createElement("div");
  messageElement.textContent = `[${message.senderID}]: ${message.messageContent}`;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to the bottom
}
