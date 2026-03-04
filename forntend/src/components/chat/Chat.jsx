import { Container, Row, Col, ListGroup, Form, InputGroup, Button, Badge } from "react-bootstrap"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { toast } from "react-toastify"
import axios from "axios"
import { useState } from "react"
import axiosApi from "../../utils/api"

function chat() {


    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            navigate("/")
        }
        toast.success(`Welcome back ${user.name}`, { position: "top-center" })
    }, [])

    // use effect for loading all contacts from bbackend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axiosApi.get("/auth/users")
                setUsers(res.data?.users)

            } catch (error) {
                console.log(error.message)
            }
        }

        fetchUsers()
    }, [])

    useEffect(() => {
        const chatHistory = async () => {
            try {
                const res = await axiosApi.get("/message/698b2c6a12f594ab7163eb7a")
                console.log(res.data?.messages)
                setChats(res.data?.messages)
            } catch (error) {
                console.log(error.message)
            }
        }
        chatHistory()
    }, [])

    const handleLogout = async () => {
        try {
            await logout()
            navigate("/")
        } catch (error) {
            navigate("/")
        }
    }


    
    return (
        <div className="d-flex flex-column" style={{ height: "100vh", overflow: "hidden", position: "relative" }}>
            {/* Top Bar */}
            <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center shadow-sm">
                <h5 className="mb-0">Chat App</h5>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                    Logout
                </Button>
            </div>

            {/* Main content Sidebar and chat screen */}
            <div className="d-flex flex-grow-1 overflow-hidden">
                {/* Sidebar contents */}
                <div className="bg-light border-end" style={{ width: "280px", minWidth: "200px" }}>
                    <div className="p-3 border-bottom bg-white">
                        <h6 className="mb-0 fw-bold">Chats</h6>
                    </div>

                    {/* User infos */}
                    <ListGroup variant="flush">
                        {users.map((contact, index) => (
                            <ListGroup.Item key={index} action
                                className="d-flex justify-content-between align-items-center py-3 px-3 border-bottom">
                                <div>
                                    <div className="fw-bold">{contact.name}</div>
                                    <small className="d-bolck text-truncate" style={{ maxWidth: "180px" }}>{contact.mobNo}</small>
                                </div>
                                {/* <div className="text-end">
                                    <small className="text-muted d-block">{contact.time}</small>
                                    {contact.unread > 0 && (
                                        <Badge bg="light" pill className="mt-1 text-primary">
                                            {contact.unread}
                                        </Badge>
                                    )}
                                </div> */}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                </div>

                

            </div>


        </div>
    )
}

export default chat