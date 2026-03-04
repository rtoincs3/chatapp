import React from 'react'
import Register from './components/Register'
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import {Routes, Route} from "react-router-dom"
import Chat from './components/chat/Chat';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import ChatPage from './pages/ChatPage';
import UpdateProfile from './components/UpdateProfile';
import ReactivateAccount from './components/auth/ReactivateAccount';
import './App.css'

function App() {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/register' element={<Register />} />
        {/* Protected Route */}
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<ChatPage />} />
          <Route path='/update-profile' element={<UpdateProfile />}  />
        </Route>

        {/* Reactivate account */}
        <Route path='/reactivate' element={<ReactivateAccount />} />
      </Routes>
    </div>
  )
}

export default App