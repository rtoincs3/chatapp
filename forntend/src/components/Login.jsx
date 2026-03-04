import { useEffect, useState } from "react"
import { Button, Container, Card, Form, Row, Col, Alert } from "react-bootstrap"
import { Link, useNavigate, } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ToastContainer, toast } from 'react-toastify';

function Login() {
    const [mobNo, setMobNo] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const { login, isLoading, user } = useAuth()
    const navigate = useNavigate()

    // if user is loggedin so dont access to login page
    useEffect(() => {
        if (!isLoading && user) {
            console.log("Login page sees logged-in user → would redirect to /");
            navigate("/chat")
        }
    }, [isLoading, user, navigate])

    // if still loading show loading
    if (isLoading) {
        return <div className="text-center mt-5">Loading.....</div>
    }

    // handle submit info
    const handleSubmit = async (e) => {
        e.preventDefault()

        setError('')
        setLoading(true)

        try {
            const data = await login(mobNo, password)
            if (data.user) {
                navigate("/chat")

            } else {
                setError("Login Error")
            }
        } catch (err) {
            const msg = err.message || err.response?.data?.message || "Login failed. Please check your credentials."
            // If account is dectivated redirect to 
            if (err.response && err.response?.data?.reason === 'ACCOUNT_DEACTIVATED') {
                navigate("/reactivate", {state: {fromLogin: true, mobNo}})
            } else {
                toast.error(msg, { position: "top-right" })
                setError(msg)
            }

        } finally {
            setLoading(false)
        }

    }



    return (
        <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-light">

            {/* Card for Register Form */}
            <Card className="shadow-lg border-0 rounded-4 p-4" style={{ maxWidth: '480px', width: '100%' }}>

                {/* Card body */}
                <Card.Body>
                    <h3 className="fw-bold text-primary text-center mb-4">Login your account</h3>


                    {/* Form Register */}
                    <Form onSubmit={handleSubmit}>
                        {/* Mobile Number*/}
                        <Form.Group className="mb-3" controlId="formName">
                            <Form.Label className="fw-medium">Mobile Number</Form.Label>
                            <Form.Control
                                name="name"
                                type="tel"
                                placeholder="Enter Mobile Number"
                                value={mobNo}
                                onChange={(e) => setMobNo(e.target.value)}
                                disabled={loading} />
                        </Form.Group>
                        {/* Password */}
                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Label className="fw-medium">Password</Form.Label>
                            <Form.Control
                                name="name"
                                type="password"
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading} />
                        </Form.Group>

                        {/* Register Button */}
                        <div className="d-grid mb-3">
                            <Button variant="primary" type="submit" size="lg" disabled={loading}>{loading ? "Signing In ...." : "Login"}</Button>
                        </div>

                        <small>
                            Don't have account <Link to="/register">Register Here</Link>
                        </small>



                    </Form>

                </Card.Body>

            </Card>

        </Container>
    )
}

export default Login