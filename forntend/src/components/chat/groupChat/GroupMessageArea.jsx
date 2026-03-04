import React from 'react'
import { useAuth } from '../../../contexts/AuthContext'

function GroupMessageArea({ chats }) {
    const { user } = useAuth()
    console.log(chats)

    return (
        <div className='flex-grow-1 overflow-auto p-4' style={{ backgroundColor: "#f0f2f5" }}>

            {/* if there is not chats */}
            {!chats || chats?.length === 0 ? (
                <div className='text-center text-muted mt-5'>No Message yet</div>

            ) : (
                // if previous chats is present
                chats.map((msg, index) => {
                    // first get if msg sent by current user
                    const isSentByMe = String(msg.sender?._id) === String(user._id)

                    const currentDate = new Date(msg.createdAt).toDateString();
                    const previousDate = index > 0 ? new Date(chats[index - 1].createdAt).toDateString() : null;
                    const showDateSeperator = currentDate !== previousDate;

                    // if message is sent by me so you other wise sender name
                    const msgSenderName = isSentByMe ? "You" : msg.sender.name

                    return (
                        <div key={msg.id || index}>

                            {/* SHow Dte Seperator */}
                            {showDateSeperator && (
                                <div className='text-center my-4 d-flex align-items-center justify-content-center'>
                                    <hr className='flex-grow-1 m-0' />
                                    <span className='mx-3 badge rounded-pill bg-secondary px-3 py-2 shadow-sm'>
                                        {new Date(msg.createdAt).toLocaleDateString("en-US", {day: "numeric", month: "long", year: "numeric"})}
                                    </span>
                                    <hr className='flex-grow-1 m-0' />
                                </div>
                            )}

                            {/* // sender and reciver message right and left side */}
                            <div className={`d-flex ${isSentByMe ? "justify-content-end" : "justify-content-start"} `}>
                                <div style={{ maxWidth: "50%" }}>

                                    {/* Message printing */}
                                    <div className={`p-2 px-3 mt-3 shadow-sm ${isSentByMe ? "bg-primary text-white" : "bg-white text-dark"}`}
                                        style={{
                                            borderRadius: "15px",
                                            borderBottomRightRadius: isSentByMe ? "2px" : "15px",
                                            borderBottomLeftRadius: !isSentByMe ? "2px" : "15px",
                                            wordBreak: "break-word",
                                            whiteSpace: "pre-wrap"
                                        }}>
                                        {msg.content}
                                    </div>

                                </div>

                            </div>
                            {/* Showing message time */}
                            <div className={`mt-1 mb-3 small text-muted ${isSentByMe ? "text-end" : "text-start"}`} style={{ fontSize: "0.75rem" }}>
                                <span className='fw-bold'>{msgSenderName}</span> • {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    )
                })
            )}



        </div>
    )
}

export default GroupMessageArea