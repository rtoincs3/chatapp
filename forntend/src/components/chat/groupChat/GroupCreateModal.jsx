import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import axiosApi from '../../../utils/api'
import { useAuth } from '../../../contexts/AuthContext'

function GroupCreateModal({ setModalShow, fetchGroups }) {
    const [users, setUsers] = useState([])
    const [groupName, setGroupName] = useState("")
    const [selectedParticipants, setSelectedParticipants] = useState([])

    const { user } = useAuth()

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axiosApi.get("/auth/users")
                setUsers(res.data?.users || [])
            } catch (error) {
                console.log(error.response?.data || error.message)
            }
        }
        fetchUsers()
    }, [])

    // handle check box change
    const handleCheckboxChange = (userId) => {
        setSelectedParticipants(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const handleBack = () => {
        setModalShow(false)
    }

    //  Form Submit create group
    const handleCreateGroup = async (e) => {
        e.preventDefault()
        try {
            const groupData = {
                name: groupName,
                members: selectedParticipants,
            }
            const res = await axiosApi.post("/group/create", groupData)
            if (res.data?.success) {
                fetchGroups()
                console.log(res.data)
                setModalShow(false)
                setGroupName("")
                setSelectedParticipants([])
            }

        } catch (error) {
            console.log(error.response || error.message)
        }
    }

    return (
        <div className="p-3">
            <h3 className="mb-4">Create Group</h3>
            <Form onSubmit={handleCreateGroup}>
                <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold'>Group Name</Form.Label>
                    <Form.Control type='text' placeholder='Enter Group Name' value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                </Form.Group>

                {/*  Users List */}
                <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold'>Participants</Form.Label>
                    <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "5px", padding: "10px" }}>
                        {/*  check if there is any users  */}
                        {users.length > 0 ? (
                            users.map((contact) => (
                                <div key={contact._id} className='mb-2 border-bottom pb-1'>
                                    <Form.Check
                                        type='checkbox'
                                        id={contact._id}
                                        label={
                                            <div className='d-flex flex-column'>
                                                <span className='font-semibold'>{contact.name}</span>
                                                <span className='text-muted'>{contact.mobNo}</span>
                                            </div>
                                        }
                                        checked={selectedParticipants.includes(contact._id)}
                                        onChange={() => handleCheckboxChange(contact._id)}
                                    />
                                </div>
                            ))
                        ) : (
                            <p className='text-muted'>No user found</p>
                        )}
                    </div>
                </Form.Group>

                {/* admin */}
                <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold'>Group Admin</Form.Label>
                    <Form.Control value={user.name} disabled />
                </Form.Group>

                <div className='d-flex gap-2'>
                    <Button variant='primary' type='submit'>Create Group</Button>
                    <Button variant='outline-secondary' onClick={handleBack}>Go Back</Button>
                </div>

            </Form>
        </div>
    )
}

export default GroupCreateModal
