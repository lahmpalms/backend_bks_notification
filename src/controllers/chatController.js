import { connectedClients, setUpWebSocketServer } from "../utils/websocket.js";
import WebSocket from "ws";

const handleChat = (req, res, next) => {
  try {
    const { message, userId } = req.body;

    if (!message || !userId) {
      res.status(400).send({
        code: 400,
        message: "Missing message or userId in request body",
      });
      throw new Error("Missing message or userId in request body");
    }

    const newMessage = { userId, message, timestamp: new Date() };

    connectedClients.forEach(({ client }) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(newMessage));
      }
    });

    res.status(200).send({ message: "Message sent successfully" });
  } catch (error) {
    next(error);
  }
};

export default { handleChat };
