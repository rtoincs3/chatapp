import { useEffect, useState } from "react"
import { Button, Container, Card, Form, Row, Col, Alert } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"

function Register() {
    const [name, setName] = useState("")
    const [mobNo, setMobNo] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const { register, user, isLoading } = useAuth()
    const navigate = useNavigate()

    const [userisLoggedIn] = useState(!!user)
    useEffect(() => {
        // if loading is false and user not null 
        if(!isLoading && user && userisLoggedIn){
            navigate("/chat")
        }
    }, [user, isLoading, navigate, userisLoggedIn])

    // if still loading
    if(isLoading) {
        return <div className="text-center mt-5">Loading.....</div>
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError("")
        setLoading(true)

        try {
            const data = await register(name, mobNo, password)
            if (data?.success) {
                console.log("Registration success – navigating to /");
                navigate("/")
            } else {
                toast.error(data?.message || "Registration Failed", {position: "top-right"})
                setError(data?.message || "Registration Failed")
            }

        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Reg failed try again"
            toast.error(msg, {position: "top-right"})
            setError(msg)
        } finally {
            setLoading(false)
        }

    }


    return (
        <>
            <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 bg-light">

                {/* Card for Register Form */}
                <Card className="shadow-lg border-0 rounded-4 p-4" style={{ maxWidth: '480px', width: '100%' }}>

                    {/* Card body */}
                    <Card.Body>
                        <h3 className="fw-bold text-primary text-center mb-4">Register your account</h3>

                        {error && (
                            <Alert
                                variant="danger"
                                dismissible
                                onClose={() => setError("")}
                            >
                                {error}   {/* ← this is the important line */}
                            </Alert>
                        )}

                        {/* Form Register */}
                        <Form onSubmit={handleSubmit}>
                            {/* Full name */}
                            <Form.Group className="mb-3" controlId="formName">
                                <Form.Label className="fw-medium">Full Name</Form.Label>
                                <Form.Control
                                    name="name"
                                    type="text"
                                    placeholder="Enter name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading} />
                            </Form.Group>
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
                                <Button variant="primary" type="submit" size="lg" disabled={loading}>{loading ? "Registring....." : "Register"}</Button>
                            </div>

                            <small >
                                Already Have Account <Link to="/">Login Here</Link>
                            </small>

                        </Form>

                    </Card.Body>

                </Card>

            </Container>
        </>
    )
}

export default Register