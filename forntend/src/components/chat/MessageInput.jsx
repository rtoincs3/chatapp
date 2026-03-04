
import React, { useRef, useState } from 'react'
import { Form, InputGroup, Button, Overlay, Tooltip, Popover } from "react-bootstrap";
import { Paperclip, XLg } from 'react-bootstrap-icons';
import { BsEmojiLaughing } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react"

function MessageInput({ messageText, fileData, setFileData, onSend, onTyping, handleFileChange, setMessageText }) {
    const fileInputRef = useRef(null);
    const [showEmoji, setShowEmoji] = useState(false)

    const target = useRef(null)

    const handleFileIconClick = () => {
        fileInputRef.current.click();
    };

    const onEmojiClick = (emojiData) => {
        setMessageText((prev) => prev + emojiData.emoji)
    }



    return (
        <div className="p-3 bg-white border-top position-relative">

            {fileData && (
                <div className="position-absolute bottom-100 start-0 mb-2 ms-3 p-2 bg-white border rounded shadow-lg d-flex align-items-center" style={{ zIndex: 100 }}>

                    {/* If images is there preview image */}
                    {fileData.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img src={URL.createObjectURL(fileData)} style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "5px" }} />
                    ) : <Paperclip size={20} />}

                    {/* if image is not here preview file pdf name and size */}
                    <div className="ms-2">
                        <div className="small text-truncate fw-bold" style={{ maxWidth: '120px' }}>{fileData.name}</div>
                        <div className="text-muted small">{(fileData.size / 1024).toFixed(1)} KB</div>
                    </div>

                    {/* for selct file close button */}
                    <Button variant="link" className="text-danger ms-2 p-0" onClick={() => { setFileData(null); fileInputRef.current.value = ""; }}>
                        <XLg size={16} />
                    </Button>

                </div>
            )}

            <InputGroup>
                <Button variant="outline-secondary" onClick={handleFileIconClick}><Paperclip /></Button>

                {/* input */}
                <Form.Control
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={onTyping}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {   // optional: prevent shift+enter newline
                            e.preventDefault();
                            onSend();   // ← this is your prop that calls handleSubmit
                        }
                    }}
                />
                <Button ref={target} variant='outline-secondary' onClick={() => setShowEmoji(!showEmoji)}><BsEmojiLaughing /></Button>

                <Overlay
                    target={target.current}
                    show={showEmoji}
                    placement="top"          
                    rootClose
                    onHide={() => setShowEmoji(false)}
                >
                    {(props) => (
                        <Popover
                            id="emoji-popover"
                            {...props}
                            style={{
                                ...props.style,
                                maxWidth: "none",         
                                width: "380px",         
                            }}
                        >
                            <Popover.Body style={{ padding: 0 }}>
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    autoFocusSearch={false}
                                    theme="light"
                                    emojiStyle="apple"
                                    width="100%"            
                                    height={400}              
                                />
                            </Popover.Body>
                        </Popover>
                    )}
                </Overlay>



                <Button variant="primary" onClick={onSend}>Send</Button>
            </InputGroup>
            <input type="file" ref={fileInputRef} className="d-none" onChange={handleFileChange} />
        </div>
    )
}

export default MessageInput
