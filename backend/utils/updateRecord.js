import mongoose from "mongoose";

import User from "../models/userModel.js";


const dbUrl = "mongodb+srv://rtobgmi1_db_user:9k1zUqiqcNVeZR88@cluster0.nwcmbsp.mongodb.net/chat1?appName=Cluster0"


async function updateAll (){
    try{
        await mongoose.connect(dbUrl)
        await User.updateMany(
            {isActive: {$ne: true}},
            {$set: {isActive: true}}
        )
        console.log("success")
    } catch(error){
        console.log(error.message)
    }
}


updateAll()