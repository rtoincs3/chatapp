import { createContext, useContext, useState, useEffect } from "react";
import axiosApi from "../utils/api.js"
import axios from "axios";



// create globle state
const AuthContext = createContext(null)

export function AuthProvider({children}) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // check login status on app starts
    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () =>{
        try {
            const res = await axiosApi.get("/auth/me")
            setUser(res.data.user)
        } catch (error) {
            console.log(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // / when user click on login this will run 
    const login = async (mobNo, password) => {
        try {
            const res = await axiosApi.post("/auth/login", {mobNo, password})

            // error
            if(!res.data?.success){
                throw new Error(res.data?.message || "Login Failed")
            }
            setUser(res.data.user || null)
            return res.data
        } catch (error) {
            throw error
        }
    }


    // when user click on register
    const register = async (name, mobNo, password) => {
        try {
            const res = await axiosApi.post("/auth/register", {
                name: name.trim(),
                mobNo: mobNo.trim(),
                password: password.trim()
            })

            // check backend success or not
            if(!res.data?.success){
                throw new Error(res.data?.message || "Register Failed")
            }
            
            return res.data
        } catch (error) {
            throw error            
        }
    }



    // when user click on logout
    const logout = async () => {
        await axiosApi.post("/auth/logout")
        setUser(null)
    }


    // return all this function to every file
    const value = {
        user,
        isLoading,
        setUser,
        register,
        login,
        logout,
        checkAuthStatus
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}



// create custom hook
export function useAuth(){
    const context = useContext(AuthContext)
    if(!context){
        throw new Error("useAuth must be inside AuthProvider")
    }

    return context
}