// src/utils/websocket.js
import { WebSocketServer } from "ws";
import { jwtDecode } from "jwt-decode";
import dotenv from "dotenv";

dotenv.config();

const connectedClients = [];

const verifyClient = async (token) => {
  try {
    const decoded = jwtDecode(token); // Assume jwtDecode is synchronous or make it async accordingly
    // Implement your token verification logic here, replace request with fetch or another HTTP client if necessary
    const response = await fetch(
      "http://18.136.199.82/api/v1/service/verify_access_service",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: decoded?.apikey,
        },
      }
    );

    const responseData = await response.json();
    if (response.ok && responseData.code === 200) {
      return { isValid: true, decoded };
    } else {
      return { isValid: false };
    }
  } catch (error) {
    console.error("Error verifying client:", error);
    return { isValid: false };
  }
};

const setUpWebSocketServer = () => {
  const wss = new WebSocketServer({ port: process.env.WEBSOCKET_PORT });
  wss.on("connection", async (client, request_ws) => {
    const token = request_ws.headers.authorization;

    try {
      if (!token) {
        client.send("Unauthorized");
        client.close();
        return;
      } else {
        const { isValid, decoded } = await verifyClient(token);
        if (isValid) {
          const clientInfo = {
            client,
            userInfo: decoded,
            token,
          };
          connectedClients.push(clientInfo);
        } else {
          client.send("Unauthorized");
          client.close();
        }
      }
    } catch (error) {
      client.send("Unauthorized");
      client.close();
      console.error("Error during WebSocket connection:", error);
    }
  });

  return wss;
};

export { setUpWebSocketServer, connectedClients };
