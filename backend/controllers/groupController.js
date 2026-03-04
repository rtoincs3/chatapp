import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";


export const createGroup = async (req, res) => {
    try {
        const adminId = req.user._id;
        const { name, members } = req.body;

        // if group name
        if (!name.trim()) {
            return res.status(400).json({ success: false, message: "Group Name is Required" })
        }

        // add current user to participant list
        const participants = [adminId, ...members]

        //  check if all members id is in Database users
        const validUsers = await User.find({ _id: { $in: participants } })
        if (!validUsers) {
            return res.status(400).json({ success: false, message: "Some User not found" })
        }

        const group = await Chat.create({
            type: "group",
            name: name.trim(),
            participants: participants,
            admin: adminId
        })

        res.status(201).json({ success: true, group })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}




//  Get group of current user
export const getMyGroups = async (req, res) => {
    try {
        const userId = req.user._id

        // find the groups of current user
        const groups = await Chat.find({
            type: "group",
            participants: userId
        })
            .populate("admin", "name, mobNo") // here we get admin info from User model through populate,
            .populate("participants", "name mobNo") // here we get all participates info from User model
            .populate("lastMessage") // here we get last message to show in sidebar
            .sort({ lastActivity: -1 })

        res.status(200).json({ success: true, groups })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}



//  send messagein group
export const sendGroupMesssage = async (req, res) => {
    try {
        //  here we are reciving chatId of group and content
        const { chatId, content } = req.body;
        const senderId = req.user._id;

        let fileUrl = null
        let fileName = null

        if (!content.trim() && !req.file) {
            return res.status(400).json({ success: false, message: "Chat or file required to send message" })
        }

        // validation
        const chat = await Chat.findById(chatId)
        // validation if SenderId is not in participants
        if (!chat.participants.includes(senderId)) {
            return res.status(400).json({ success: false, message: "Unautorized" })
        }

        if (req.file) {
            fileUrl = req.file.path.replace(/\\/g, "/")
            fileName = req.file.originalname
        }

        //  now create message
        const newMssage = await Message.create({
            sender: senderId,
            chat: chat._id,
            content: content.trim(),
            chatId: chat._id.toString(),
            fileUrl,
            fileName,
            readBy: [senderId]
        })

        // update the Db for lastMessage and lastActivity
        chat.lastMessage = newMssage._id;
        chat.lastActivity = new Date()

        // saving the chat DB
        chat.save()

        const fullMessage = await Message.findById(newMssage._id)
            .populate("sender", "name mobNo")
            .populate("chat", "name")

        res.status(201).json({ success: true, fullMessage })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}



//  for getting group messages
export const getGroupMessage = async (req, res) => {
    try {
        //  chat id from params and user id currently login
        const { chatId } = req.params;
        const userId = req.user._id;

        //  verify if group is exist or not
        const chat = await Chat.findById(chatId)
        if (!chat) {
            return res.status(400).json({ success: false, message: "Group not exist" })
        }

        //  if current user is not member of group
        const isMember = chat.participants.includes(userId)
        if (!isMember) {
            return res.status(400).json({ success: false, message: "You are not member of this group" })
        }

        //  fetch message for this group
        //  we use createdAt -1 for recive oldest to newst message
        const messages = await Message.find({ chatId })
            .populate("sender", "name mobNo")
            .sort({ createdAt: 1 })

        //  now mark message as read by this user
        await Message.updateMany(
            {
                chat: chatId,
                readBy: { $ne: userId }
            },
            {$addToSet: {readBy: userId}}
        ),

        res.status(200).json({success: true, messages})


    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}