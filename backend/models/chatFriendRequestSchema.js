import mongoose from "mongoose"


const chatFriendRequestSchema = mongoose.Schema({
    //  here we will sender and reciver request and request status
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
}, {timestamps: true})


// prevent duplicate pending request for same two people
chatFriendRequestSchema.index({sender: 1, recipient: 1}, {unique: true})

const ChatFriendRequest = mongoose.model("ChatFriendRequest", chatFriendRequestSchema)
export default ChatFriendRequest
