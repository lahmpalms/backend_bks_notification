// src/routes/broadcastRoutes.js
import express from 'express';
import broadcastController from '../controllers/broadcastController.js';

const router = express.Router();

router.post('/', broadcastController.sendBroadcast);

export default router;
