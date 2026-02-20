import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";
import { userModel } from "./model/user.model.js";

export const authenticationDB=async()=>{
    try{
        const DataBaseConnectionResult=await mongoose.connect(DB_URI);
        await userModel.syncIndexes();
        console.log("DB-CONNECTED SUCCESSFULLY");
    }
    catch(error){
        console.log("FAIL TO CONNECT TO DATABASE");
    }
}