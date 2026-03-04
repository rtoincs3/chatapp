import express from "express"
import { createGroup, getMyGroups, sendGroupMesssage, getGroupMessage } from "../controllers/groupController.js";
import authMiddleware from "../middleware/authMiddleware.js"
import upload from "../middleware/multerMiddleware.js";


const groupRouter = express.Router()


// create group
groupRouter.post("/create", authMiddleware, createGroup)

// get all groups where  current user is member
groupRouter.get("/my-groups", authMiddleware, getMyGroups)

// send message to group
groupRouter.post("/send", upload.single("file"), authMiddleware, sendGroupMesssage)

// Getting chat history for group
groupRouter.get("/get/:chatId", authMiddleware, getGroupMessage) 


export default groupRouter