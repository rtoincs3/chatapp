
import React, { useRef, useEffect, useLayoutEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext';
import { FaDownload } from "react-icons/fa";
import EmojiOne from 'react-emoji-render';
import { Emoji } from 'emoji-picker-react';



function MessageArea({ chats, fileData, setShowLightbox, setActiveImage, isGroup }) {
    const { user } = useAuth()
    const messageEndRef = useRef(null);

    function getSafeFileUrl(fileUrl) {
        if (!fileUrl) return "";

        // Clean path (remove any junk, fix slashes)
        let clean = fileUrl
            .trim()
            .replace(/\\/g, '/')                    // backslashes
            .replace(/\/{2,}/g, '/')                // double slashes
            .replace(/^.*?(\/uploads\/)/, '$1');    // keep only /uploads/... part

        // Force leading slash if missing
        if (!clean.startsWith('/')) clean = '/' + clean;

        const fullUrl = `http://localhost:4000${clean}`;

        return fullUrl;
    }

    // scroll to bottom
    // Inside MessageArea.jsx
    // useEffect(() => {
    //     if (messageEndRef.current) {
    //         // Use a 100ms delay so the browser can calculate the new height
    //         const timer = setTimeout(() => {
    //             messageEndRef.current.scrollTo({
    //                 top: messageEndRef.current.scrollHeight,
    //                 behavior: "smooth" // Optional: makes it look nicer
    //             });
    //         }, 1);

    //         return () => clearTimeout(timer);
    //     }
    // }, [chats, fileData]);

    //     here this is a function om emoji render in apple style 


    // useLayoutEffect runs BEFORE the browser paints the screen
    const renderMessageWithAppleEmojis = (text) => {
        const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;

        return text.split(emojiRegex).map((part, i) => {
            if(part.match(emojiRegex)){
                return (
                    <span key={i} style={{ display: "inline-block", verticalAlign: "middle" }}>
                        <Emoji unified={part.codePointAt(0)?.toString(16)}
                        size={26}
                        emojiStyle='apple' />
                    </span>
                )
            }
            return part
        })
    }  
    
    
    
    
    
    useLayoutEffect(() => {
        if (messageEndRef.current) {
            // Instant snap to bottom
            messageEndRef.current.scrollTop = messageEndRef.current.scrollHeight;
        }
    }, [chats]); // Fires every time chats array changes

    return (
        <div className="flex-grow-1 p-4 overflow-auto" style={{ backgroundColor: "#f0f2f5" }} ref={messageEndRef}>
            {!chats || chats.length === 0 ? (
                <div className="text-center text-muted mt-5">No messages yet.</div>
            ) : (
                chats.map((msg, index) => {
                    const isSentByMe = String(msg.sender?._id || msg.sender) === String(user._id);

                    const isImage = msg.fileUrl?.match(/\.(jpg|jpeg|png|gif)$/i);


                    const currentDate = new Date(msg.createdAt).toDateString();
                    const previousDate = index > 0 ? new Date(chats[index - 1].createdAt).toDateString() : null;
                    const showDateSeparator = currentDate !== previousDate;

                    // //  this is emoji regx with this we will know if this is a text or emoji
                    // const emojiOnlyRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])+(\s*(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]))*$/g
                    // const isBigEmoji = msg.content && emojiOnlyRegex.test(msg.content.trim()) && [...msg.content.trim()].length <= 3

                    // if message is sent by me so your name  other wise sender name
                    let msgSenderName = ""
                    if (isGroup && msg.sender?.name) {
                        msgSenderName = isSentByMe ? "You" : msg.sender.name
                    }

                    return (
                        <div key={msg._id || index}>
                            {showDateSeparator && (
                                <div className="text-center my-4 d-flex align-items-center justify-content-center">
                                    <hr className="flex-grow-1 m-0" />
                                    <span className="mx-3 badge rounded-pill bg-secondary px-3 py-2 shadow-sm">
                                        {new Date(msg.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                                    </span>
                                    <hr className="flex-grow-1 m-0" />
                                </div>
                            )}

                            <div className={`d-flex ${isSentByMe ? "justify-content-end" : "justify-content-start"} mb-3`}>
                                <div style={{ maxWidth: "50%" }}>
                                    {isImage && (
                                        <div className="mb-1 position-relative">
                                            <img
                                                src={getSafeFileUrl(msg.fileUrl)}
                                                className="rounded-4 shadow-sm"
                                                style={{
                                                    maxHeight: "250px",
                                                    maxWidth: "100%",

                                                    cursor: "pointer",
                                                    display: "block"
                                                }}
                                                onClick={() => {
                                                    setActiveImage(getSafeFileUrl(msg.fileUrl));
                                                    setShowLightbox(true);
                                                    console.log("File url is a ", msg.fileUrl)
                                                }}
                                                alt="Shared image"
                                                onError={(e) => {
                                                    console.error("Image failed to load after refresh:", {
                                                        original: msg.fileUrl,
                                                        attempted: getSafeFileUrl(msg.fileUrl)
                                                    });

                                                }}
                                            />

                                        </div>
                                    )}

                                    {(msg.content || (msg.fileUrl && !isImage)) && (
                                        <div
                                            className={`p-2 px-3 shadow-sm`}
                                            style={{
                                                borderRadius: "15px",
                                                borderBottomRightRadius: isSentByMe ? "2px" : "15px",
                                                borderBottomLeftRadius: !isSentByMe ? "2px" : "15px",
                                                wordBreak: "break-word",
                                                whiteSpace: "pre-wrap",               // ← important for mixed content
                                                backgroundColor: isSentByMe ? "#9EE8FF" : "#ffff",
                                                display: 'inline-block',


                                            }}
                                        >
                                            {/* CALL THE EMoji FUNCTION HERE */}
                                            {renderMessageWithAppleEmojis(msg.content)}
                                            {/* {msg.content && (
                                                <span
                                                    style={{
                                                        fontSize: isBigEmoji ? '2.5rem' : '1rem',   // bigger for pure emoji messages
                                                        lineHeight: isBigEmoji ? '1.1' : '1.4',      // keeps them in one line
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word',
                                                        verticalAlign: 'middle',
                                                    }}
                                                >
                                                    {msg.content}
                                                </span>
                                            )} */}
                                            {msg.fileUrl && !isImage && (
                                                <div className={`mt-2 p-2 rounded border ${isSentByMe ? "bg-white bg-opacity-10" : "bg-light"}`}>
                                                    <a
                                                        href={`http://localhost:4000/${msg.fileUrl}`}
                                                        target="_blank"
                                                        download={msg.fileName}
                                                        className={`d-flex align-items-center justify-content-between text-decoration-none small ${isSentByMe ? "text-black" : "text-primary"}`}
                                                    >
                                                        <span className="text-truncate me-2" style={{ maxWidth: '150px' }}>
                                                            {msg.fileName}
                                                        </span>
                                                        <FaDownload />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {/* Showing message time */}
                                    <div className={`mt-1 mb-3 small text-muted ${isSentByMe ? "text-end" : "text-start"}`} style={{ fontSize: "0.75rem" }}>
                                        {msgSenderName && <span className='fw-bold'>&nbsp; {msgSenderName} • </span>}
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    )
}

export default MessageArea
