import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import fs from "fs";
import express from "express";
import cors from "cors";
import { jwtDecode } from "jwt-decode";
import mongoose from "mongoose";
import request from "request";
import Service from "./serviceModel.js";

const clientPort = 8080;
const webSocketPort = 4000;
const serverPort = 3000;
const connectedClients = [];

const app = express();
app.use(
  cors({
    origin: "http://localhost:3001",
  })
);
const wss = new WebSocketServer({ port: webSocketPort });

app.use(express.json()); // Parse JSON bodies

app.listen(serverPort, () => {
  console.log(`server listening on ${serverPort}`);
  mongoose
    .connect("mongodb://18.143.76.245:27017/microservice_database", {
      user: "admin",
      pass: "islabac123",
      authSource: "admin", // or 'admin' or wherever your user is defined
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to microservice_database successfully"))
    .catch((err) =>
      console.error("Error connecting to microservice_database:", err)
    );
});

wss.on("connection", (client, request_ws) => {
  try {
    const token = request_ws.headers.authorization;
    const decoded = jwtDecode(token);
    request.get(
      {
        url: "http://18.136.199.82/api/v1/service/verify_access_service",
        auth: { bearer: token },
        headers: { apikey: decoded?.apikey },
      },
      function (error, response, body) {
        const response_server = JSON.parse(response.body);
        if (error || response_server.code !== 200) {
          console.error("API verification failed:", error || body);
          client.send(JSON.stringify({ error: "Authentication failed" }));
          return client.close();
        } else {
          console.log(
            "Verification successful! Server responded with:",
            response.body
          );
          connectedClients.push({
            client: client,
            userInfo: decoded,
            token: token,
          });
        }
      }
    );

    client.on("message", (message) => {
      const now = new Date().toISOString();
      console.log(`${now} - User ${decoded.user_id} sent message: ${message}`);
    });
  } catch (error) {
    console.error("Error during WebSocket connection:", error);
  }
});

app.get("/", (req, res) => {
  // const clientCount = connectedClients.length;
  // res.json({ message: `Connected clients: ${clientCount}`, connectedClients });
  res.send("Hello World!");
});

app.post("/sendboardcast", async (req, res) => {
  const { message, service_id } = req.body;
  if (!message || !service_id) {
    return res.status(400).send({ error: "Missing message in request body" });
  }
  try {
    const services = await Service.findById(service_id);
    console.log("Services:", services?.apikey);
    let arr = services?.apikey;
    console.log("apiarr", arr);
    try {
      connectedClients.forEach(({ client, userInfo }) => {
        if (client && userInfo) {
          if (
            client.readyState === WebSocket.OPEN &&
            arr.includes(userInfo.apikey)
          ) {
            console.log("TRUE", userInfo.apikey);
            let data = {
              message: message,
              sender: "Server",
            };
            client.send(JSON.stringify(data));
          }
        } else {
          console.error("Invalid client or userInfo:", { client, userInfo });
        }
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  } catch (err) {
    console.error("Error fetching data:", err);
  }

  res.status(200).send({ message: "Message sent successfully" });
});



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

console.log(`WebSocket server listening on port ${webSocketPort}`);
