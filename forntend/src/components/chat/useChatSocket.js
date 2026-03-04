import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "../../contexts/AuthContext";
import axiosApi from "../../utils/api";

const SOCKET_URL = "http://localhost:4000";
const socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
});

export function useChatSocket(selectedItem, isGroup = false) {
    const [chats, setChats] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [userOnline, setUserOnline] = useState(new Set());
    const [currentLastSeen, setCurrentLastSeen] = useState(null); // ← better initial

    const typingTimeoutRef = useRef(null);
    const { user } = useAuth();

    const selectedIdRef = useRef(selectedItem._id)

        useEffect(() => {
        // FIX: Assign the actual ID from selectedItem to the ref
        selectedIdRef.current = selectedItem?._id; 
        setCurrentLastSeen(selectedItem?.lastSeen ?? null);
    }, [selectedItem?._id, selectedItem?.lastSeen]); // Watch both ID and lastSeen


    // Fetch history -
    useEffect(() => {
        if (!selectedItem?._id) {
            setChats([]);
            return;
        }
        const fetchChatHistory = async () => {
            try {
                //  here first find if its group then group url otherwise chat url
                const url = isGroup
                    ? `/group/${selectedItem._id}`
                    : `/message/${selectedItem._id}`

                const res = await axiosApi.get(url);
                setChats(res.data?.messages || []);
            } catch (error) {
                console.error("Failed to load chat history:", error.message);
            }
        };
        fetchChatHistory();
    }, [selectedItem?._id]);


    // Socket effect
    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        //  if user is in group then join group chat
        if (isGroup && selectedItem?._id) {
            socket.emit("join_group", selectedItem?._id)
        }

        const onReceive = (data) => {
            console.log("Incoming socket data:", data);

            // Get the current conversation ID
            // 1. For Groups: The ID is the selectedItem._id
            // 2. For Private: The ID is stored in the messages themselves (data.chatId)

            const isMessageForCurrentChat = isGroup
                ? data.chatId === selectedItem?._id
                : data.chatId === chats[0]?.chatId || data.sender === selectedItem?._id;

            // A simpler, safer check if you have chatId in your selectedUser object:
            if (isMessageForCurrentChat || data.chatId === selectedItem?.chatId) {
                setChats((prev) => {
                    // Prevent duplicate messages if optimistic update already added it
                    const exists = prev.find(m => m._id === data._id);
                    if (exists) return prev;
                    return [...prev, data];
                });
            }
        };


        // Use named functions → can safely off() them later
        const onUserOnline = (userId) => {
            setUserOnline((prev) => new Set([...prev, userId]));
        };

        const onOnlineList = (ids) => {
            setUserOnline(new Set(ids));
        };

        const onTyping = ({ senderId }) => {
            if (!selectedItem?._id) return;
            if (senderId === selectedItem._id) {
                setIsTyping(true);
            }
        };

        const onStopTyping = ({ senderId }) => {
            if (!selectedItem?._id) return;
            if (senderId === selectedItem._id) {
                setIsTyping(false);
            }
        };

        const onUserOffline = ({ userId, lastSeen }) => {
            setUserOnline((prev) => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
            // if (selectedItem?._id === userId) {
            //     setCurrentLastSeen(lastSeen);
            // }
            if (selectedIdRef.current === userId) {
                setCurrentLastSeen(lastSeen);
            }
        };

        socket.on("userOnline", onUserOnline);
        socket.on("onlineUsersList", onOnlineList);
        socket.on("user_typing", onTyping);
        socket.on("user_stopped_typing", onStopTyping);
        socket.on("userOffline", onUserOffline);
        socket.on("receive_message", onReceive); // 

        // Proper cleanup with exact handlers
        return () => {
            socket.off("userOnline", onUserOnline);
            socket.off("onlineUsersList", onOnlineList);
            socket.off("user_typing", onTyping);
            socket.off("user_stopped_typing", onStopTyping);
            socket.off("userOffline", onUserOffline);
            socket.off("receive_message", onReceive);
        };
    }, [selectedItem?._id, user?._id]);

    // Fix typing cleanup
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const sendTyping = () => {
        if (selectedItem?._id) {
            socket.emit("typing", { reciver: selectedItem._id }); // fixed spelling
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("stop_typing", { reciver: selectedItem._id });
            }, 500);
        }
    };

    const stopTyping = () => {
        if (selectedItem?._id) {
            socket.emit("stop_typing", { reciver: selectedItem._id });
        }
    };

    const sendMessage = (newMessage) => {
        socket.emit("send_message", newMessage);
    };

    return {
        chats,
        setChats,
        isTyping,
        userOnline,
        currentLastSeen,
        setCurrentLastSeen,
        sendTyping,
        stopTyping,
        sendMessage,
        typingTimeoutRef,
    };
}