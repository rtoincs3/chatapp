import { Button, Container, Modal, Table, Form, Alert } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { useEffect } from 'react'
import axiosApi from '../utils/api.js'
import { FaArrowLeft } from "react-icons/fa";

function UpdateProfile() {
  const [headerName, setHeaderName] = useState("")
  const [name, setName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  
  const [error, setError] = useState("")

  const [alertShow, setAlertShow] = useState(true)
  //Modal show
  const [modalSHow, setModelShow] = useState(false)

  const [modalShow2, setModalShow2] = useState(false)

  const { logout, user, isLoading } = useAuth()
  const navigate = useNavigate()


  // check use is there or not
  useEffect(() => {
    if (!isLoading) return;
    if (!user) {
      navigate("/")
      return
    }
  }, [user, isLoading, navigate])

  useEffect(() => {
    if (user && user.name) {
      setName(user.name)
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      toast.error(error.message || "Logout Failed", { position: "top-left" })
    }
  }

  const handleSubmitUpdate = async (e) => {

    try {
      const res = await axiosApi.put("/auth/update", { name, currentPassword, newPassword })
      if (res.data.success) {
        setHeaderName(res.data?.user?.name)
        toast.success("Profile Updated")
        handleModalClose()
        setCurrentPassword("")
        setNewPassword("")
      }
    } catch (error) {
      // toast.error(error.response?.data?.message || "Update Failed", { position: "top-center" })
      setError(error.response?.data?.message || "Update Failed")
      setCurrentPassword("")
      setNewPassword("")
    }
  }

  const handleSubmitDelete = async () => {
    try {
      await axiosApi.delete("/auth/deactivate")
      toast.warning("Your account temporary Deactivated for Activate Please login again")
      handleLogout()
    } catch (error) {
      // toast.error(error.response?.data?.message || "Delete Failed", { position: "top-center" })
       setError(error.response?.data?.message || "Delete Failed")
    }
  }


  // Bootstrap Modal Features
  const handleModalSHow = () => {
    setModelShow(true)
    setError("")
  }
  const handleModalClose = () => {
    setModelShow(false)
    setError("")
  }
  const handleModalSHow2 = () => {
    setModalShow2(true)
    setError("")
  }
  const handleModalClose2 = () => {
    setModalShow2(false)
    setError("")
  }

  // handle close alert
  const handleCloseAlert = () => {
    setAlertShow(false)
    setError("")
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center shadow-sm">
        <div className='d-flex'>
          <h5 className='me-3'><FaArrowLeft className='text-white' onClick={handleBack} /></h5>
        <h5 className="mb-0">Chat App</h5>
        </div>
        <h5 className="mb-0">{headerName || user.name}</h5>
        <div>
          <Button
            variant="outline-light"
            size="sm"
            className="mx-2"
            onClick={handleLogout}
          >
            Logout
          </Button>

        </div>
      </div>
      <Container className='mt-5'>
        {/* // table */}
        <Table striped>
          <thead>
            <tr>
              <th>#</th>
              <td>Name</td>
              <td>MobNo</td>
              <td>actions</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>{headerName || user.name}</td>
              <td>{user.mobNo}</td>
              <td>
                <Button variant='primary' onClick={handleModalSHow}>Update</Button>
                <Button variant='primary' className='ms-3' onClick={handleModalSHow2}>Delete</Button>
              </td>
            </tr>
          </tbody>
        </Table>


        {/* Bootstrap Modal */}
        <Modal show={modalSHow} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Modal Heading </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {error && (
              <Alert variant='danger' onClick={handleCloseAlert} dismissible>{error}</Alert>
            )}
            <Form  >
              <Form.Group className='mb-3'>
                <Form.Label>Full Name</Form.Label>
                <Form.Control type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmitUpdate();
                    }
                  }}

                />
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control type="text" value={user.mobNo} disabled />
              </Form.Group>

              <Form.Group className='mb-3'>
                <Form.Label>Current Password</Form.Label>
                <Form.Control type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmitUpdate();
                    }
                  }} />
              </Form.Group>

              <Form.Group>
                <Form.Label>New Password</Form.Label>
                <Form.Control type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitUpdate();
                    }
                  }} />
              </Form.Group>

            </Form>
          </Modal.Body>

          <Modal.Footer>
            <Button variant='secondary' onClick={handleModalClose}>Close</Button>
            <Button variant='primary' onClick={handleSubmitUpdate}>Save Changes</Button>
          </Modal.Footer>

        </Modal>

        <Modal show={modalShow2} onHide={handleModalClose2}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && (
              <Alert variant='danger' onClick={handleCloseAlert} dismissible >{error}</Alert>
            )}
            {error ? '' : "Are You Sure Want to Delete Account"}
            </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose2}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSubmitDelete}>
              Delete Account
            </Button>
          </Modal.Footer>
        </Modal>


      </Container>
    </>
  )
}

export default UpdateProfile