import React, { useEffect, useRef, useState } from 'react'
import GroupChatHeader from './GroupChatHeader'
import GroupInput from './GroupInput'
import GroupMessageArea from './GroupMessageArea'
import axiosApi from '../../../utils/api'
import MessageArea from '../MessageArea'
import MessageInput from '../MessageInput'
import ImageLightbox from '../ImageLightBox'
import { useChatSocket } from '../useChatSocket'



function GroupChatScreen({ selectedGroup, isGroup }) {
  const [isLoading, setIsLoading] = useState(true)
  const [messageText, setMessageText] = useState("")
  const [fileData, setFileData] = useState(null)
  const [showLightbox, setShowLightbox] = useState(false);
  const [activeImage, setActiveImage] = useState("");

  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { chats,
    setChats,
    isTyping,
    userOnline,
    currentLastSeen,
    setCurrentLastSeen,
    sendTyping,
    stopTyping,
    sendMessage,
    typingTimeoutRef } = useChatSocket(selectedGroup, true)

  console.log("file dta is ", fileData)
  // fetching chats for selected group
  useEffect(() => {
    if (!selectedGroup?._id) return;

    const fetchChats = async () => {
      try {
        const res = await axiosApi.get(`/group/get/${selectedGroup?._id}`)
        console.log("chats is ", res.data.messages)
        setChats(res.data?.messages)

        setIsLoading(false)
      } catch (error) {
        console.log(error.response?.data || error.message)
      }
    }
    fetchChats()
  }, [selectedGroup?._id])


  // User Input message text
  const handleInputChange = (e) => {
    setMessageText(e.target.value);
  };

  // On Submit message 
  const handleSubmit = async () => {
    if ((!messageText.trim() && !fileData) || !selectedGroup?._id) return;

    const formData = new FormData()
    formData.append("chatId", selectedGroup?._id)
    formData.append("content", messageText.trim())
    if (fileData) formData.append("file", fileData)

    try {
      const res = await axiosApi.post("/group/send", formData)
      const newMessage = res.data.fullMessage

      // 1. Update your own screen
      setChats(prev => [...prev, newMessage])

      // 2. TELL THE SOCKET THIS IS A GROUP MESSAGE
      sendMessage({
        chatId: selectedGroup._id,        // Use the Group ID as the room ID
        type: "group",                   // CHANGED: Was "private" before
        message: newMessage,
        participants: selectedGroup.participants
      })

      setMessageText("")
      setFileData(null)
      if (fileInputRef.current) fileInputRef.current.value = ""

    } catch (error) {
      console.log(error.message)
    }
  }

  // when user upload file data
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFileData(file);
  };


  return (
    <div className='d-flex flex-column h-100 position-relative'>

      {/* Image Open when click */}
      {showLightbox && (
        <ImageLightbox image={activeImage} onClose={setShowLightbox} />
      )}

      {/* Chat Header */}
      <GroupChatHeader selectedGroup={selectedGroup} />


      {/* Messages Area */}
      <MessageArea chats={chats} fileData={fileData} setShowLightbox={setShowLightbox} isGroup={isGroup} setActiveImage={setActiveImage} />

      {/* Input area */}
      <MessageInput setMessageText={setMessageText} messageText={messageText} fileData={fileData} setFileData={setFileData} onSend={handleSubmit} onTyping={handleInputChange} handleFileChange={handleFileChange} />

    </div>
  )
}

export default GroupChatScreen