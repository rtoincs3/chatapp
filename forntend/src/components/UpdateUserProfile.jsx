import React, { useEffect, useRef, useState } from 'react'
import { Button, Form, Modal, Image, Row, Col, Tab, Nav, Alert } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { PencilFill } from 'react-bootstrap-icons'
import axios from 'axios'
import axiosApi from '../utils/api'
import SimpleImageCropper from './chat/SimpleImageCropper'

const BASE_IMAGE_URL = import.meta.env.VITE_BASE_URL_IMAGE;


function UpdateUserProfile({ handleCloseModal, updateProfileModal, setFileData, fileData, fetchUsers }) {
    const [name, setName] = useState("")
    const [tempImage, setTempImage] = useState(null)  // raw image
    const [isCropping, setIsCropping] = useState(false)

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const { user, setUser } = useAuth()
    console.log("base url is ", BASE_IMAGE_URL)

    const fileInputRef = useRef(null)


    const handleIconClick = () => {
        fileInputRef.current.click()
    }

    // handle file chnage
    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = () => {
                setTempImage(reader.result)
                setIsCropping(true) // open cropper viewer
            }
            reader.readAsDataURL(file)
        }
        setFileData(file)
    }

    const onCropDone = (croppedFile) => {
        setFileData(croppedFile)   // save to backend final cropped image
        setIsCropping(false)
        setTempImage(null)
    }

    // First fetch user name
    useEffect(() => {
        setName(user.name)
    }, [user, updateProfileModal])

    useEffect(() => {
        if (!updateProfileModal) {
            // Reset everything when modal closes
            setError("");
            setSuccessMessage("");
            setCurrentPassword("");
            setNewPassword("");
            // If you want to reset the file preview too:
            setFileData(null);
        }
    }, [updateProfileModal]);


    //  Handle Update Profile
    const handleUpdateProfile = async (e) => {

        const formData = new FormData()
        formData.append("name", name)
        if (currentPassword) formData.append("currentPassword", currentPassword)
        if (newPassword) formData.append("newPassword", newPassword)

        if (fileData) {
            formData.append("profilePic", fileData)
        }

        try {
            const res = await axiosApi.put("/auth/update", formData)
            if (res.data.success) {
                setUser(res.data.user)
                fetchUsers()
            }
            setFileData(fileData)
            setName(name)
            setSuccessMessage("Profile Updated")
            setCurrentPassword("")
            setNewPassword("")

            setTimeout(() => {
                handleCloseModal()
            }, 500)

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Update Failed"
            setError(errorMessage)
            console.log(error.response.data.message)
        }
    }

    const handleCloseAlert = () => {
        setError("")
        setSuccessMessage("")
    }

    //  crop modal cancle
    const handleCloseCrop = () => {
        setIsCropping(false)
        setFileData(null)
    }

    return (
        <div>
            <Modal show={updateProfileModal} onHide={handleCloseModal} size='lg' >
                <Modal.Header closeButton>
                    <Modal.Title>Update Profile</Modal.Title>

                </Modal.Header>

                <Modal.Body className='pb-4 pt-4'>
                    {/* if user select image show this  */}
                    {error && (
                        <Alert variant='danger' onClick={handleCloseAlert} dismissible size="sm" > {error} </Alert>
                    )}
                    {successMessage && (
                        <Alert variant='success' onClick={handleCloseAlert} dismissible size="sm" > {successMessage} </Alert>
                    )}
                    {isCropping ? (
                        <SimpleImageCropper imageSrc={tempImage} onCropComplete={onCropDone} onCancel={handleCloseCrop} />
                    ) : (
                        <Tab.Container id='left-tabs-example' defaultActiveKey="user-info">
                            <Form>

                                <Row>
                                    {/* Sidebar navigation */}
                                    <Col sm={4} className='border-end' >
                                        <Nav variant='pills' className='flex-column'>
                                            <Nav.Item><Nav.Link eventKey="user-info">User Info</Nav.Link></Nav.Item>
                                            <Nav.Item><Nav.Link eventKey="change-password">Password</Nav.Link></Nav.Item>
                                        </Nav>
                                    </Col>

                                    {/* COntent Area */}

                                    <Col sm={8}>
                                        <Tab.Content>

                                            {/* User Info */}
                                            <Tab.Pane eventKey="user-info">

                                                {/* Profile Picture  */}
                                                <Form.Group className='mb-4 text-center'>
                                                    <div className='position-relative d-inline-block'>


                                                        <Image
                                                            src={fileData ? URL.createObjectURL(fileData) : `${BASE_IMAGE_URL}/${user.profilePic}`}
                                                            roundedCircle
                                                            width="120"
                                                            height="120"
                                                            style={{ objectFit: 'cover', border: '2px solid #dee2e6' }}
                                                        />

                                                        {/* File Input */}
                                                        <div
                                                            onClick={handleIconClick}
                                                            className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                cursor: 'pointer',
                                                                border: '2px solid white',
                                                                transform: 'translate(10%, 10%)' // fine-tune position
                                                            }}
                                                        >
                                                            <PencilFill size={14} />

                                                        </div>
                                                        {/* Hidden File Input */}
                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            style={{ display: 'none' }}
                                                            onChange={handleFileChange}
                                                        />
                                                    </div>
                                                </Form.Group>

                                                {/*  FUll name */}
                                                <Form.Group className='mb-2'>
                                                    <Form.Label>Ful Name</Form.Label>
                                                    <Form.Control type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                handleUpdateProfile();
                                                            }
                                                        }}
                                                    />
                                                </Form.Group>

                                                {/*  Mobile Number */}
                                                <Form.Group className='mb-3'>
                                                    <Form.Label>Mobile Number</Form.Label>
                                                    <Form.Control type="text" value={user.mobNo} disabled style={{ cursor: "not-allowed" }} />
                                                </Form.Group>



                                            </Tab.Pane>

                                            {/* Password change */}
                                            <Tab.Pane eventKey="change-password">
                                                {/* Current Password */}
                                                <Form.Group className='mb-3'>
                                                    <Form.Label>Current Password</Form.Label>
                                                    <Form.Control type="password"
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                handleUpdateProfile();
                                                            }
                                                        }}
                                                    />

                                                </Form.Group>
                                                {/* New Password */}

                                                <Form.Group>
                                                    <Form.Label>New Password</Form.Label>
                                                    <Form.Control type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                handleUpdateProfile();
                                                            }
                                                        }}
                                                    />
                                                </Form.Group>
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </Col>


                                </Row>
                            </Form>

                        </Tab.Container>
                    )}

                </Modal.Body>

                {!isCropping && (
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleUpdateProfile}>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                )}

            </Modal>
        </div>
    )
}

export default UpdateUserProfile