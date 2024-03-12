import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import fs from "fs";
import express from "express";
import cors from "cors";

const clientPort = 8080;
const webSocketPort = 4000;
const serverPort = 3000;

let messageFromAdmin = ""; // Store admin message

const app = express();
app.use(
  cors({
    origin: "http://localhost:3001", // Allow requests from this origin
  })
);
const wss = new WebSocketServer({ port: webSocketPort });

app.use(express.json()); // Parse JSON bodies

app.listen(serverPort, () => {
  console.log(`server listening on ${serverPort}`);
  wss.on("message", (message, client) => {
    console.log("Received message from client:", message, client); // Log the message
    // ... other actions to handle the message (optional) ...
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/sendboardcast", (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).send({ error: "Missing message in request body" });
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      let data = {
        message,
        sender: "Server",
      };
      client.send(JSON.stringify(data));
    }
  });

  res.status(200).send({ message: "Message sent successfully" });
});

// Inside your existing app.js file

app.post("/chat", (req, res) => {
  const { message, userId } = req.body; // Extract message and userId

  if (!message || !userId) {
    return res
      .status(400)
      .send({ error: "Missing message or userId in request body" });
  }

  console.log("message", message);
  console.log("userId", userId);

  // Create a message object (optional)
  let newMessage = { userId, message, timestamp: new Date() };

  // Broadcast the message to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Send the message object or just the message content
      client.send(JSON.stringify(newMessage)); // Send message object
      // OR
      // client.send(message); // Send just the message content
    }
  });

  res.status(200).send({ message: "Message sent successfully" });
});

fs.readFile("./index.html", function (err, html) {
  if (err) throw err;

  http
    .createServer(function (request, response) {
      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(html);
      response.end();
    })
    .listen(clientPort);
});

console.log(`WebSocket server listening on port ${webSocketPort}`);
