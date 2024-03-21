import Service from "../models/Service.js";
import { connectedClients, setUpWebSocketServer } from "../utils/websocket.js";
import WebSocket from "ws";

const sendBroadcast = async (req, res) => {
  const { message, service_id } = req.body;

  if (!message || !service_id) {
    return res
      .status(400)
      .send({ error: "Missing message or service_id in request body" });
  }

  try {
    const service = await Service.findById(service_id);
    console.log("Service:", service?.apikey);

    if (!service || !service.apikey) {
      return res
        .status(404)
        .send({ error: "Service not found or no API key available" });
    }

    const apiKeys = Array.isArray(service.apikey)
      ? service.apikey
      : [service.apikey];
    console.log("API keys for broadcast:", apiKeys);

    connectedClients.forEach(({ client, userInfo }) => {
      if (
        client &&
        userInfo &&
        client.readyState === WebSocket.OPEN &&
        apiKeys.includes(userInfo.apikey)
      ) {
        console.log("Broadcasting to:", userInfo.apikey);
        const data = {
          message,
          sender: "Server",
        };
        client.send(JSON.stringify(data));
      }
    });

    res.status(200).send({ message: "Broadcast sent successfully" });
  } catch (err) {
    console.error("Error in broadcast operation:", err);
    res.status(500).send({ error: "Internal server error" });
  }
};

export default { sendBroadcast };
