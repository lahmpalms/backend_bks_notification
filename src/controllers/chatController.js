// import { wss } from "../utils/websocket.js";

const handleChat = (req, res) => {
  const { message, userId } = req.body;

  if (!message || !userId) {
    return res
      .status(400)
      .send({ error: "Missing message or userId in request body" });
  }

  const newMessage = { userId, message, timestamp: new Date() };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(newMessage));
    }
  });

  res.status(200).send({ message: "Message sent successfully" });
};

export default { handleChat };
