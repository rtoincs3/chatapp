
import User from "../models/userModel.js";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs"




export const userRegister = async (req, res, next) => {
    try {
        const { name, mobNo, password } = req.body

        if (!name || !mobNo || !password) {
            return res.status(400).json({ success: false, message: "alll name are required" })
        }

        // mobile number validation
        let cleanMobNo = mobNo.trim()  // here trime you number        
        const mobileRegex = /^[6789]\d{9}$/;
        if (!mobileRegex.test(cleanMobNo)) {
            return res.status(400).json({ success: false, message: "Number starts with 6789 and length must be 10 digit" })
        }


        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ success: false, message: "Password must be 8 char one upper case and one special symbole" })
        }

        // password hash
        const hashedPassowrd = await bcrypt.hash(password, 10)

        // find if user is exist or not
        const existingUser = await User.findOne({ cleanMobNo })

        if (existingUser) {
            return res.status(200).json({ success: false, message: "User with same mob already exist" })
        }

        const user = await User.create({
            name,
            mobNo,
            password: hashedPassowrd
        })
        user.password = undefined

        // socket emit change to live updated in frontend 
        if(req.io){
            req.io.emit("new_user_registered", {
                _id: user._id,
                name: user.name,
                mobNo: user.mobNo,
                profilePic: user.profilePic
            })
        }


        res.status(201).json({ success: true, user })


    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}


export const currentUser = async (req, res) => {
    try {
        if (!req.user._id || req.user._id === null) {
            res.status(400).josn({ success: false, message: "No user found" })
        }
        res.status(200).json({ success: true, user: { _id: req.user._id, name: req.user.name, mobNo: req.user.mobNo, profilePic: req.user.profilePic } })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}



export const userLogin = async (req, res) => {
    try {
        const { mobNo, password } = req.body

        // find if user exist or not
        const user = await User.findOne({ mobNo })
        if (!user) {
            return res.status(200).json({ success: false, message: "User Not exists" })
        }

        // if user is inactivate then not login 
        if (user.isActive === false) {
            return res.status(404).json({ success: false, reason: "ACCOUNT_DEACTIVATED", message: "Your account is deactivated" })
        }

        // compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: "invalid credential" })
        }

        // generate token and save in cookies
        const token = user.generateToken()

        res.cookie('authToken', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax"
        })

        user.password = undefined

        res.status(200).json({ success: true, message: " Login Succesfull", user, token })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}


export const userLogout = async (req, res) => {
    try {
        // clear cookies
        res.clearCookie("authToken", {
            httpOnly: true,
            maxAge: 0
        })

        res.status(200).json({ success: true, message: "Logged out success" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}




// GET all Users without curreent user for sidebar
export const getAllUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        const { q } = req.query   // search items 

        let users;

        if (q && q.trim().length > 0) {
            // name or mobilenumber exist incase sensitive
            const searchRegex = new RegExp(q.trim(), "i")
            console.log(searchRegex)

            users = await User.find({
                _id: { $ne: currentUserId },
                isActive: true,
                $or: [
                    { name: { $regex: searchRegex } },
                    { mobNo: { $regex: searchRegex } }
                ]
            })
                .select("name mobNo lastSeen profilePic")
                .sort({ name: 1 })
            console.log(users)

        } else {
            users = await User.find({
                _id: { $ne: currentUserId },
                isActive: true
            })
                .select("name mobNo lastSeen profilePic")
                .sort({ name: 1 });
        }

        // const users = await User.find({ id: { $ne: currentUserId } })
        //     .select("name mobNo")
        //     .sort({ name: 1 })
        //     // .limit(50)

        res.status(200).json({ success: true, users })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}



// update Profile of user
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, currentPassword, newPassword } = req.body;

        const updateFields = {};
        
        if(!name){
            return res.status(400).json({success: false, message: "Name is Required"})
        }
        
        // Name update
        if (name?.trim()) {
            updateFields.name = name.trim();
        }

        //  For File Data
        console.log("updated field are", updateFields)
         // 2. MOVE THIS HERE: Profile Pic update (runs even if password isn't changed)
        if (req.file) {
            // Stores "uploads/profile/filename.jpg"
            updateFields.profilePic = req.file.path.replace(/\\/g, "/");
        }


        // Password update
        if (currentPassword || newPassword) { 
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ success: false, message: "both passsword field are required" })
            }
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            if (currentPassword === newPassword) {
                return res.status(400).json({
                    success: false,
                    message: "both password must not be same",
                });
            }

            const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is incorrect",
                });
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                return res.status(400).json({
                    success: false,
                    message: "New password must be 8+ chars with uppercase, lowercase, number & special char",
                });
            }

            updateFields.password = await bcrypt.hash(newPassword, 10);
        }


        // No changes?
        if (Object.keys(updateFields).length === 0) {
            const currentUser = await User.findById(userId).select("-password");
            return res.status(400).json({
                success: false,
                message: "No changes provided",
                user: currentUser,
            });
        }

        console.log("updated field are", updateFields)
        // Update and return fresh data
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, select: "-password" }
        );

        //  socket emit changes to frontend so front end display updated user without refresh
        req.io.emit("user_updated", {
            _id: updatedUser._id,
            name: updatedUser.name,
            profilePic: updatedUser.profilePic
        })

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};




// delete user
export const deactivateUser = async (req, res) => {
    try {
        // find user from DB
        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(400).json({ success: false, message: "User not defined" })
        }

        user.isActive = false
        await user.save()

        res.clearCookie("authToken", {
            httpOnly: true,
            maxAge: 0
        })

        return res.status(200).json({ success: true, message: "Your Account is deactivated" })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}






// reactivate account
export const reactivateUser = async (req, res) => {
    try {
        const { mobNo, password } = req.body

        if (!mobNo || !password) {
            return res.status(400).json({ success: false, message: "Field Missing" })
        }

        // find user if exist or not
        const user = await User.findOne({ mobNo })
        if (!user) {
            return res.status(400).json({ success: false, message: "User Not exist with mobile number" })
        }

        // compare password 
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            return res.status(400).json({ success: false, message: "Invalid Credential" })
        }

        // if password match then active status will activate
        user.isActive = true
        await user.save()

        res.status(200).json({ success: true, message: "Account Activated" })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}
