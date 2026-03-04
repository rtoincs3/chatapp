
// controllers/messageController.js
import Message from "../models/messageModel.js";
import Chat from "../models/chatModel.js";
import getchatId from "../utils/chatId.js";


// Get chat history with one specific user
export const getChatHistory = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const otherUserId = req.params.otherUserId;

        if (!otherUserId) {
            return res.status(400).json({ success: false, message: "No other user found" });
        }

        const chatId = getchatId(currentUserId, otherUserId);

        // Find the chat document
        const chat = await Chat.findOne({
            participants: { $all: [currentUserId, otherUserId] },
            type: "private"
        });

        if (!chat) {
            return res.status(200).json({ success: true, messages: [], chatId });
        }

        // Fetch messages for this chat
        const messages = await Message.find({ chat: chat._id })
            .sort({ createdAt: 1 })
            .limit(200)
            .populate("sender", "name email"); // optional: populate sender info

        // Mark messages as read (exclude own messages)
        await Message.updateMany(
            {
                chat: chat._id,
                sender: { $ne: currentUserId },
                isRead: false
            },
            { $set: { isRead: true } }
        );
       
        res.status(200).json({ success: true, messages, chatId });

    } catch (error) {
        console.error("getChatHistory error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};



export const sendMessage = async (req, res) => {
    try {

        const { reciverId, content } = req.body;
        const senderId = req.user?._id;

        if (!senderId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        if (!reciverId) {
            return res.status(400).json({ success: false, message: "Receiver ID required" });
        }

        if (!content?.trim() && !req.file) {
            return res.status(400).json({ success: false, message: "Content or file required" });
        }

        const chatId = getchatId(senderId, reciverId);

        let chat = await Chat.findOne({
            type: "private",
            participants: { $all: [senderId, reciverId] }
        });

        if(!chat){
            return res.status(400).json({success: false, message: "YOu Must be friends to send message"})
        }

        // if (!chat) {
        //     chat = await Chat.create({
        //         type: "private",
        //         participants: [senderId, reciverId],
        //         chatId: getchatId(senderId, reciverId),
        //         name: "Private Chat"
        //     });
        //     console.log("Created new chat:", chat._id);
        // }

        let fileUrl = null;
        let fileName = null;

        if (req.file) {
            fileUrl = req.file.path.replace(/\\/g, "/");
            fileName = req.file.originalname;
        }

        const chatMessage = await Message.create({
            sender: senderId,
            chat: chat._id,
            content: content?.trim() || "",
            fileUrl,
            fileName,
            chatId,
            isRead: false
        });


        chat.lastMessage = chatMessage._id;
        chat.lastActivity = new Date();
        await chat.save();

        // // Emit to receiver
        // const receiverRoom = reciverId.toString();
        // io.to(receiverRoom).emit("recive_message", chatMessage.toObject());
        // console.log(`Emitted to room: ${receiverRoom}`);

        res.status(201).json({ success: true, chatMessage });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            details: "Check server logs for full stack"
        });
    }
};
