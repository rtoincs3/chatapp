import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"


function ProtectedRoute() {
    const {isLoading, user} = useAuth()
    if(isLoading){
        return <div className="text-center mt-5">Checking Authentication</div>
    }
    if(!user){
        return <Navigate to="/" replace />
    }
  return (
    <Outlet />
  )
}

export default ProtectedRoute




// import { useAuth } from "../contexts/AuthContext"
// import { Navigate, Outlet } from "react-router-dom"

// function ProtectedRoute() {
//     const {isLoading, user} = useAuth()
//     if (isLoading){
//         return <div className="text-center mt-5">Checking authentication...</div>;
//     }
//     if(!user){
//         return <Navigate to="/" replace />;
//     }
//   return <Outlet />
// }

// export default ProtectedRoute