// messageRoute.js  (or wherever you define the router)
import express from "express"
import multer from 'multer';
import { getChatHistory, sendMessage } from "../controllers/messageController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/multerMiddleware.js";

const messageRouter = express.Router();

messageRouter.get("/:otherUserId", authMiddleware, getChatHistory);
messageRouter.post("/send", upload.single("file"), authMiddleware, sendMessage)

export default messageRouter;