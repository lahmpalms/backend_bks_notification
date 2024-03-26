// src/app.js
import express from "express";
import cors from "cors";
import http from "http";
import fs from "fs";
import mongoose from "mongoose";
import { setUpWebSocketServer } from "./utils/websocket.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import broadcastRoutes from "./routes/broadcastRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
setUpWebSocketServer(server);

// MongoDB connection
connectDB();

// Set up HTTP routes
app.use("/chat", chatRoutes);
app.use("/broadcast", broadcastRoutes);
app.use("/service", serviceRoutes);

const PORT = process.env.SERVER_PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
