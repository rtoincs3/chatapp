
import { useEffect, useRef, useState } from "react";
import axiosApi from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import ChatHeader from "./ChatHeader";
import MessageArea from "./MessageArea";
import MessageInput from "./MessageInput";
import { useChatSocket } from "./useChatSocket";
import ImageLightbox from "./ImageLightBox";

function ChatScreen({ selectedUser }) {
    // const [chats, setChats] = useState([]);
    const { user } = useAuth();
    const [messageText, setMessageText] = useState("");
    // const [userOnline, setUserOnline] = useState(new Set());
    const [fileData, setFileData] = useState(null);
    const [showLightbox, setShowLightbox] = useState(false);
    const [activeImage, setActiveImage] = useState("");
    // const [isTyping, setIsTyping] = useState(false);
    // const [currentLastSeen, setCurrentLastSeen] = useState(selectedUser?.lastSeen);

    // use socket hook to import all function
    const { chats,
        setChats,
        isTyping,
        userOnline,
        currentLastSeen,
        setCurrentLastSeen,
        sendTyping,
        stopTyping,
        sendMessage,
        typingTimeoutRef } = useChatSocket(selectedUser)

    const messageEndRef = useRef(null);
    const fileInputRef = useRef(null);
    // const typingTimeoutRef = useRef(null);


    // // update the last seen
    // useEffect(() => {
    //     setCurrentLastSeen(selectedUser?.lastSeen)
    // }, [selectedUser?._id, selectedUser?.lastSeen])



    const handleInputChange = (e) => {
        setMessageText(e.target.value);
        sendTyping()
    };

    //  for sending message to backend
    const handleSubmit = async () => {
        if ((!messageText.trim() && !fileData) || !selectedUser?._id) return;

        const formData = new FormData();
        formData.append("reciverId", selectedUser._id);
        formData.append("content", messageText.trim());
        if (fileData) formData.append("file", fileData);

        try {
            const res = await axiosApi.post("/message/send", formData);
            const newMessage = res.data.chatMessage;
            
            // Optimistic update - show immediately
            setChats(prev => [...prev, newMessage]);
            
            sendMessage({
                chatId: newMessage.chatId,
                type: "private",
                message: newMessage,
                participants: [user._id, selectedUser._id]
            })
            setMessageText("");
            setFileData(null);

            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (error) {
            console.error("Send Error:", error.message, error.response?.data);
        }
    };




    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setFileData(file);
    };



    if (!selectedUser) {
        return (
            <div className="h-100 d-flex flex-column justify-content-center align-items-center text-muted bg-white">
                <h4>Select a chat to start messaging</h4>
                <small>Click on a user from the sidebar</small>
            </div>
        );
    }
    if (!user || !user._id) {
        return (
            <div className="h-100 d-flex justify-content-center align-items-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading user...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column h-100 position-relative">
            {showLightbox && (
                <ImageLightbox image={activeImage} onClose={setShowLightbox} />
            )}

            {/* Chat Header */}
            <ChatHeader selectedUser={selectedUser} isTyping={isTyping} userOnline={userOnline} currentLastSeen={currentLastSeen} />

            {/* Messages Area */}
            <MessageArea chats={chats} fileData={fileData} setShowLightbox={setShowLightbox} setActiveImage={setActiveImage} />

            {/* Input Area */}
            <MessageInput messageText={messageText} setMessageText={setMessageText} fileData={fileData} setFileData={setFileData} onSend={handleSubmit} onTyping={handleInputChange} handleFileChange={handleFileChange} />
            
        </div>
    );
}

export default ChatScreen;