import React from 'react'
import { Button } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

function Logout() {
    const {user, logout} = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
         try {
            await logout()
            navigate("/")
         } catch (error) {
            console.log(error.message)
         }   
    }

  return (
    <Button variant='outline-danger' size='sm' onClick={handleLogout}>
        Logout
    </Button>
  )
}

export default Logout