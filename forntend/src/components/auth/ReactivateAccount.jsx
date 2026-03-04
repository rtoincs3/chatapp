import { useState } from "react"
import { Button, Container, Card, Form, Row, Col, Alert } from "react-bootstrap"
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom"
import axiosApi from "../../utils/api"
import { toast } from "react-toastify"
import { useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"

function ReactivateAccount() {
    const {user, isLoading} = useAuth()
    
    const [password, setPassword] = useState("")
    const location = useLocation()
    const navigate = useNavigate()
    
    useEffect(() => {
        toast.info("Please Reactivate Your Account", {position: "top-right"})
    }, [])
    
    // Reactivate function
    const handleReactivate = async (e) => {
        e.preventDefault()
        try {
            const res = await axiosApi.post("/auth/reactivate",{mobNo, password})
            if(res.data?.success){
                toast.success("Account Activated please login again", {position: "top-right"})
                navigate("/chat")
            }
        } catch (error) {
            console.log(error.response.data)
            const errorMessage = error.response?.data?.message || "Reactivated Failed"            
            toast.error(errorMessage, {position: "top-right"})
        }
    }

    // if user is not comming from Login then redirect to page
    const isAllowed = location.state?.fromLogin
    console.log(isAllowed)
    if (!isAllowed) {
        return <Navigate to="/" replace />
    }

    // get mobNo from loginPage
    const { mobNo } = location.state


    return (
        <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-light">

            {/* Card for Register Form */}
            <Card className="shadow-lg border-0 rounded-4 p-4" style={{ maxWidth: '480px', width: '100%' }}>

                {/* Card body */}
                <Card.Body>
                    <h3 className="fw-bold text-primary text-center mb-4">Reactivate Your Account</h3>


                    {/* Form Register */}
                    <Form onSubmit={handleReactivate}>
                        {/* Mobile Number*/}
                        <Form.Group className="mb-3" controlId="formName">
                            <Form.Label className="fw-medium">Mobile Number</Form.Label>
                            <Form.Control
                                type="tel"
                                placeholder="Enter Mobile Number"
                                value={mobNo} disabled />
                        </Form.Group>
                        {/* Password */}
                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Label className="fw-medium">Password</Form.Label>
                            <Form.Control
                                name="name"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>

                        {/* Register Button */}
                        <div className="d-grid mb-3">
                            <Button variant="primary" type="submit" size="lg">Reactivate Account</Button>
                        </div>

                        {/* <small>
                            Don't have account <Link to="/register">Register Here</Link>
                        </small> */}



                    </Form>

                </Card.Body>

            </Card>

        </Container>
    )
}

export default ReactivateAccount