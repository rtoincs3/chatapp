import React, { useState } from 'react'
import { Button, ListGroup, Modal } from 'react-bootstrap'
import { List } from 'react-bootstrap-icons'
import { FaInfoCircle } from 'react-icons/fa' // Or FaEllipsisV for a menu

function GroupChatHeader({ selectedGroup }) {
    const [modalShow, setModalShow] = useState(false)

    const handleModal = () => setModalShow(!modalShow)

    if (!selectedGroup) return null;

    return (
        <>
            <div className='p-3 border-bottom bg-light d-flex align-items-center shadow-sm'>
                {/* Left: Avatar */}
                <div className='me-3'>
                    <div className='rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center'
                        style={{ width: "48px", height: "48px", fontWeight: "bold" }}>
                        {selectedGroup.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                </div>

                {/* Center: Name and Members */}
                <div>
                    <h5 className='mb-0'>{selectedGroup.name || "Select Chat"}</h5>
                    <small className='text-muted'>{selectedGroup.participants?.length || 0} members</small>
                </div>

                {/* Right: Button Icon (ms-auto pushes this to the end) */}
                <div className='ms-auto'>
                    <Button
                        variant="link"
                        className="text-muted p-2 shadow-none"
                        onClick={handleModal}
                    >
                        <FaInfoCircle size={20} />
                    </Button>
                </div>
            </div>

            <Modal show={modalShow} onHide={handleModal} centered scrollable size="sm">
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: '1rem' }}>Group Participants</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <ListGroup variant="flush">
                        {selectedGroup.participants.map((member) => (
                            <ListGroup.Item
                                key={member._id}
                                className="d-flex justify-content-between align-items-center py-2 px-3 border-0"
                            >
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{member.name}</div>
                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{member.mobNo}</div>
                                </div>

                                {/* If admin is an object, we need admin._id */}
                                {member._id === selectedGroup.admin?._id && (
                                    <span className="text-primary fw-bold">ADMIN</span>
                                )}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
            </Modal>


        </>
    )
}

export default GroupChatHeader
