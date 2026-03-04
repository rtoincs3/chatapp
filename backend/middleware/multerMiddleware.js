import multer from "multer"
import fs from "fs"
import path from "path"



// ensure upload directory exist in backend /uploads/chat
const uploadDir = "uploads/chat"
const profileDir = "uploads/profile"
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, {recursive: true})
}



// save to local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = file.fieldname  === "profilePic" ? profileDir : uploadDir
        cb(null, dest)
    }, 
    filename: (req, file, cb) => {
        const nameOnly = path.parse(file.originalname).name;
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9)
        cb(null, nameOnly + "_" + uniqueName + path.extname(file.originalname))
    },
})



const upload = multer({storage})

export default upload
