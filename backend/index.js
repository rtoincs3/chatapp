

import 'dotenv/config';
import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import { Server } from "socket.io"
import http from 'http'
import jwt from "jsonwebtoken"
import cookie from "cookie"
import path from "path"

import userRouter from "./routes/userRoute.js"
import messageRouter from "./routes/messageRoute.js"
import Message from "./models/messageModel.js"
import getChatId from "./utils/chatId.js"
import User from './models/userModel.js';
import groupRouter from './routes/groupRoute.js';

dotenv.config()


// app intialization
const app = express()

// connectdb
connectDB()

// middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))



// here we initilize the server for creating live chat
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
})

// file upload middleware
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


//  io middleware for socket use in controllers
app.use((req, res, next) => {
    req.io = io;
    next()
})


// auth
app.use("/api/auth", userRouter)

// message
app.use("/api/message", messageRouter)

// group
app.use("/api/group", groupRouter)


const PORT = process.env.PORT || 4000

// Socket auth middleware
io.use((socket, next) => {
    try {
        const cookieHeaders = socket.handshake.headers.cookie;
        if (!cookieHeaders) {
            console.log("No cookie headers")
            return next(new Error("No Cookie Headers found"))
        }

        const cookies = cookie.parse(cookieHeaders)
        console.log("Parsed cookies:", Object.keys(cookies))

        const token = cookies.authToken
        if (!token) {
            console.log("Auth token missing")
            return next(new Error("Auth token missing"))
        }

        console.log('Token first 20 chars:', token.substring(0, 20) + "...")
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        socket.userId = decoded.id
        console.log(`User ID in socket: ${socket.userId}`)

        next()
    } catch (error) {
        console.log("Socket auth error:", error.message)
        next(new Error("Authentication failed"))
    }
})

// Online users tracking
const onlineUsers = new Map()

io.on("connection", (socket) => {
    const userId = socket.userId

    if (!userId) return socket.disconnect(true)

    // Track online sockets per user
    if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set())
    }
    onlineUsers.get(userId).add(socket.id)

    socket.join(userId)

    // Send current online list to new user
    socket.emit("onlineUsersList", Array.from(onlineUsers.keys()))

    // Notify everyone else
    socket.broadcast.emit("userOnline", userId)

    // Join Group messages
    socket.on("join_group", (chatId) => {
        socket.join(chatId);
        console.log(`User ${userId} join the group messages : ${chatId}`)
    })

    // Typing events
    socket.on("typing", (data) => {
        io.to(data.reciver).emit("user_typing", { senderId: socket.userId })
    })

    socket.on("stop_typing", (data) => {
        io.to(data.reciver).emit("user_stopped_typing", { senderId: socket.userId })
    })

    //  send message 
    socket.on("send_message", (data) => {
        const { chatId, type, message, participants } = data

        //  check if one to one chat or group
        if (type === "group") {
            socket.to(chatId).emit("receive_message", message)
        } else {
            const receiverId = participants.find(id => id.toString() !== socket.userId.toString());
            if (receiverId) {
                socket.to(receiverId.toString()).emit("receive_message", message);
            }
        }
    })

    // Disconnect handling
    socket.on("disconnect", async () => {
        const sockets = onlineUsers.get(userId)
        if (!sockets) return

        sockets.delete(socket.id)

        if (sockets.size === 0) {
            const now = new Date()
            onlineUsers.delete(userId)

            try {
                await User.findByIdAndUpdate(userId, { lastSeen: now })
            } catch (error) {
                console.log("Error updating lastSeen:", error.message)
            }

            socket.broadcast.emit("userOffline", { userId, lastSeen: now })
        }
    })
})

server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})