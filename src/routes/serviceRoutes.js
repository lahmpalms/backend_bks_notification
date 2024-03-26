import express from "express";
import { connectedClients } from "../utils/websocket.js";

const router = express.Router();

router.get("/healthcheck", (req, res) => {
  res.json({ status: "Server is up and running" });
});

router.get("/userscheck", (req, res) => {
  try {
    let arrofuser = [];
    for (const user of connectedClients) {
      const userObj = {
        userInfo: user?.userInfo,
        token: user?.token,
      };
      arrofuser.push(userObj);
    }
    res
      .status(200)
      .json({
        data: arrofuser.length > 0 ? arrofuser : "Do not have user.",
        count: arrofuser.length,
      });
  } catch (error) {
    res.status(500).json({ status: "Internal Server Error" });
  }
});

export default router;
