import mongoose from "mongoose"


const messageSchema = mongoose.Schema({
    // WHo send the message
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // // who recive the message
    // reciver: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //     required: "true"
    // },


    // here we remove reciver because noe Chat scehma will give participates like [user1, user2....]
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
        index: true
    },

    content: {
        type: String,
        // required: [true, "Message is required"]
    },
    // file upload
    fileUrl: {
        type: String,
    },
    fileName: {
        type: String
    },

    // chat id for get faster queries
    chatId: {
        type: String,
        required: true,
        index: true, // for faster query
    },
    // message is read or not 1 to 1
    isRead: {
        type: Boolean,
        default: false
    },

    // for group which users read the message
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]



}, {timestamps: true})
 

// indexing for faster loading
messageSchema.index({chatId: 1, createdAt: -1})

const Message = mongoose.model("Message", messageSchema)

export default Message