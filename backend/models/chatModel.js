import mongoose from "mongoose"



const chatSchema = mongoose.Schema({

    // here type is private chat or group chat frontend will know if this is a private or group
    type: {
        type: String,
        enum: ["private", "group"],
        required: true,
        default: "private"
    },

    // participates like [user1 - user2] in group [user1-user-2-user-3....] 
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],

    // only for groups if Group name Family
    name: {
        type: String,
        required: function () { return this.type === "group"; }  // only required for groups
    },

    // is group then admin
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    // last message for sidebar
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },

    lastActivity: {
        type: Date,
        default: Date.now()
    }


}, { timestamps: true })


// indexing for faster sidebar loading
chatSchema.index({ participants: 1 })
chatSchema.index({ lastActivity: -1 })

const Chat = mongoose.model("Chat", chatSchema)

export default Chat