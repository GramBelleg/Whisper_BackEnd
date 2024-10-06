const socket = new WebSocket("ws://localhost:5000");

const apiUrl = "http://127.0.0.1:5000/api/message/send";

socket.addEventListener("open", (event) => {
  console.log("Connected to WebSocket server");
});

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  displayMessage(message);
});

document.getElementById("send-button").addEventListener("click", async () => {
  const input = document.getElementById("message-input");
  const messageContent = input.value;
  const senderID = "Youssef";
  const receiverID = "Mohamed";

  try {
    // Send the message to the backend using fetch
    socket.send(JSON.stringify({ senderID, receiverID, messageContent }));
    displayMessage({ senderID, receiverID, messageContent });
    const response = await fetch(`${apiUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ senderID, receiverID, messageContent }),
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
