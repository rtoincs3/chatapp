import express from "express"
import { currentUser, deactivateUser, getAllUsers, reactivateUser, updateProfile, userLogin, userLogout, userRegister } from "../controllers/userController.js"
import authMiddleware from "../middleware/authMiddleware.js"
import upload from "../middleware/multerMiddleware.js"

const userRouter = express.Router()


// -----------------------------------------------------------------------------------------------------
// --------------------------------  USER AUTH ---------------------------------------------------------
// -----------------------------------------------------------------------------------------------------
// register
userRouter.post("/register", userRegister)

// login 
userRouter.post("/login", userLogin)

// logout
userRouter.post("/logout", userLogout)

// get current users
userRouter.get("/me", authMiddleware, currentUser)

// get all users for sidebar
userRouter.get("/users",authMiddleware, getAllUsers)



// -------------------------------------------------------------------------------------------------------
// ----------------------------------------  USER CRUD ---------------------------------------------------
// -------------------------------------------------------------------------------------------------------

// update user profile
userRouter.put("/update", upload.single("profilePic") ,authMiddleware, updateProfile)

// delete user
userRouter.delete("/deactivate", authMiddleware, deactivateUser)



// account Re Activate
userRouter.post("/reactivate", reactivateUser)

export default userRouter