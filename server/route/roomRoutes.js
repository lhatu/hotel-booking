import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { createRoom, getOwnerRoom, getRoom, toggleRoomAvailability } from '../controller/roomController.js';

const roomRouter = express.Router();

roomRouter.post('/', upload.array("images", 4), protect, createRoom)
roomRouter.get('/', getRoom)
roomRouter.get('/owner', protect, getOwnerRoom)
roomRouter.post('/toggle-availability', protect, toggleRoomAvailability)

export default roomRouter;