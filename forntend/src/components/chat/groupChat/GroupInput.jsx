import React, { useRef, useState } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { Paperclip, XLg } from 'react-bootstrap-icons'

function GroupInput({messageText, onTyping, onSend, setFileData, fileData, handleFileChange}) {
    const fileInputRef = useRef(null)
    
    return (
        <div className='p-3 bg-white border-top'>

            <div className='position-absolute bottom-100 start-0 mb-2 ms-3 p-2 bg-white border rounded shadow-lg d-flex align-items-center' style={{zIndex: 100}}>

                {/* if file data is there and images is there preview here */}
                {fileData.name.match(/\.(jpg|png|jpeg|gif)$/i) ? (
                    <img src={URL.createObjectURL(fileData)} style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "5px" }} />
                ) : <Paperclip /> }

                {/* if image is not and some other file preview here */}
                <div className='ms-2'>
                    <div className='small text-truncate fw-bold'>{fileData.name}</div>
                    <div className='text-muted small'>{(fileData.size / 1024).toFixed(1)} KB</div>
                </div>

                {/*  for selected file close button */}
                <Button variant='link' className='text-danger ms-2 p-0' onClick={() => {setFileData(null); fileInputRef.current.value = "" }} >
                    <XLg size={16} />
                </Button>

            </div>


            <Form onSubmit={(e) => onSend(e)}>
                <InputGroup>
                <Button variant="outline-secondary" onClick={handleFileIconClick}><Paperclip /></Button>
                    <Form.Control
                        placeholder="Type a message..."
                        aria-label="Type a message"
                        value={messageText}
                        onChange={onTyping}
                    />
                    <Button variant="primary" type="submit">
                        Send
                    </Button>
                </InputGroup>
            </Form>
        </div>
    )
}

export default GroupInput