import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Plese enter your name"]
    },
    mobNo: {
        type: String,
        required: [true, "Please enter your number"],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [6, "Password must be atleast 6 charcter"]
    },
    // when user delete it update it to isActive false
    isActive: {
        type: Boolean,
        default: true
    },

    profilePic: {
        type: String,
        default: "uploads/profile/profilePic.webp"
    },

    // for user last seen 
    lastSeen: {
        type: String,
        default: Date.now
    }
}, { timestamps: true })


// for hashing password
// userSchema.pre("save", async function () {
//     // No "next" parameter

//     if (!this.isModified("password")) {
//         return;                    // safe — no next to call
//     }

//     this.password = await bcrypt.hash(this.password, 10);
//     // No next() needed
// });

// // compare password
// userSchema.methods.comparePassword = async function (enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password)
// }

// generate token for user



userSchema.methods.generateToken = function () {
    return jwt.sign({
        id: this._id,
        name: this.name,
        mobNo: this.mobNo
    },
    process.env.JWT_SECRET,
    {expiresIn: '7d'}
    )
}


userSchema.index({name: "text", mobNo: "text"})

const User = mongoose.model("User", userSchema)
export default User