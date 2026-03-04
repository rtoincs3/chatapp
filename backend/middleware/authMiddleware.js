import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.authToken
        if (!token) {
            return res.status(400).json({ status: false, message: "User is Logged out or invalid token" })
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET)

        req.user = await User.findById(decode.id).select('-password')

        next()

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


export default authMiddleware