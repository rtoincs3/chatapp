
import ChatFriendRequest from "../models/chatFrientRequestModel.js";
import Chat from "../models/chatModel.js"



// for sending the friend request to sender to reciver
export const sendFriendRequest = async (req, res) => {
    try {
        const { recipientId } = req.body
        const senderId = req.user._id

        //  Validation: Can't add yourself
        if (senderId.toString() === recipientId) {
            return res.status(400).json({ success: false, message: "You Can't add your self as a frined" })
        }

        //  check if the request is already exist between same two user
        const existingRequest = await ChatFriendRequest.findOne({
            $or: [
                { sender: senderId, recipient: recipientId },
                { sender: recipientId, recipient: senderId }
            ]
        })

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: existingRequest.status === "pending" ? "Request already Pending" : "You are already friends"
            })
        }

        //  now send friend request
        const newRequest = await ChatFriendRequest.create({
            sender: senderId,
            recipient: recipientId,
            status: "pending"
        })

        //  socket emit chnges ehn send freind request
        // notify recipient immedatly
        req.io.to(recipientId.toString()).emit("new_chat_request", {
            senderId: senderId,
            requestId: newRequest._id
        })

        res.status(201).json({success: true, message: "Freind Request Sent", requestId: newRequest._id})


    } catch (error) {
        res.status(500).json({success: false, mmessage: error.message})
    }
}


//  for accepting friend request
export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        const currentUserId = req.user._id

        // first we will fnd id if id is exit in freindRequest modal or not
        const request = await ChatFriendRequest.findById(requestId)

        // now we will check if current user id and recipent id is same like the same user who got request
        if (!request || !request.recipient.equals(currentUserId) ) {
            return res.status(400).json({ success: false, message: "Freind Request Not Found" })
        }

        //  now accept the freind request
        request.status = "accepted"
        await request.save()

        // now 0we need to check if chat room is there for both users
        let chat = await Chat.findOne({
            type: "private",
            participants: {$all: [request.sender, request.recipient]}
        })

        //  now if chat room not exist createit or update it
        if(!chat) {
            chat = await Chat.create({
                type: "private",
                participants: [request.sender, request.recipient],
                lastActivity: new Date()
            })
        } else{
            //  here if sender and reciver previous frend and then unfreiend and then frend req so this will prevent creating new chat 
            chat.lastActivity = new Date()
            await chat.save()
        }

        // notify sender that other user accept the request
        const senderId = request.sender.toString()
        req.io.to(senderId).emit("chat_request_accepted", {
            receiverId: currentUserId,
            chatId: chat._id
        })
        
        //  now send chatId 
        res.status(200).json({ success: true, message: "Freind Request Accepted", chatId: chat._id })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}


export const getRelatonshipStatus = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const currentUserId = req.user._id;

        // 1. Check if Chat exists
        const chat = await Chat.findOne({
            type: "private",
            participants: { $all: [currentUserId, otherUserId] }
        });

        if (chat) {
            return res.status(200).json({ status: "Friends", chatId: chat._id });
        }

        // 2. Check for Request
        const request = await ChatFriendRequest.findOne({
            $or: [
                { sender: currentUserId, recipient: otherUserId },
                { sender: otherUserId, recipient: currentUserId }
            ]
        });

        if (!request) {
            return res.status(200).json({ status: "None" });
        }

        // if request is rejected
        if (request.status === "rejected") {
            return res.status(200).json({ status: "Rejected" }); 
        }

        if (request.status === "pending") {
            if (request.sender.equals(currentUserId)) {
                return res.status(200).json({ status: "Pending_Request" });
            } else {
                return res.status(200).json({ status: "Pending_Recived", requestId: request._id });
            }
        }
        
        // 4. Safety Fallback: Always send a response!
        return res.status(200).json({ status: "None" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



//  if user reject the freidn request
export const rejectChatRequest = async (req, res) => {
    try {
        const {requestId, senderId} = req.body;
        const currentUserId = req.user._id

        // Delete Database
        const deleteRequest = await ChatFriendRequest.findByIdAndDelete(requestId)
        if (!deleteRequest) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        //  socket for notify the original user
        req.io.to(senderId.toString()).emit("chat_request_rejected", {
            recipientId: currentUserId,
            requestId: requestId
        })

        res.status(200).json({ success: true, message: "Request rejected and deleted" });

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}



