import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { isYesterday, format, isToday, formatDistance, formatDistanceToNow } from "date-fns"


const BASE_IMAGE_URL = import.meta.env.VITE_BASE_URL_IMAGE;


function ChatHeader({ selectedUser, isTyping, userOnline, currentLastSeen }) {

    // User last seen function
    const getLastseenFunction = (lastSeenDate) => {
        if(!lastSeenDate) return "away"

        const date = new Date(lastSeenDate)

        if(isToday(date)){
            return `Last Seen ${format(date, 'p')}`
        }

        if(isYesterday(date)){
            return `Yesterday at ${format(date, "p")}`
        }

        //  if user offline like one day ago two day ago 1month ago
        return formatDistanceToNow(date, {addSuffix: true})
    }

    return (
        <div className="p-3 border-bottom bg-light d-flex align-items-center">
            <div className="me-3 position-relative">
                <div className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center bg-secondary" 
                style={{ width: "48px", height: "48px", fontWeight: "bold" }}>
                    <img src={`${BASE_IMAGE_URL}/${selectedUser.profilePic}`} style={{width: "100%", height: "100%", objectFit: "cover"}} />
                </div>
            </div>
            <div>
                
                <h5 className="mb-0">{selectedUser.name || "Select Chat"}</h5>
                <small className={userOnline.has(selectedUser?._id) ? "text-success" : "text-muted"}>
                    {/* {userOnline.has(selectedUser?._id) ? "Online" : "Offline"} */}
                    {/* {isTyping ? "Typing..." : (userOnline.has(selectedUser?._id) ? "Online" : "Offline")} */}

                    {isTyping ? "Typing..." : (userOnline.has(selectedUser?._id) ? "online" : (<span className="text-gray-500">{getLastseenFunction(currentLastSeen)}</span>))}
                </small>
            </div>
        </div>
    )
}

export default ChatHeader