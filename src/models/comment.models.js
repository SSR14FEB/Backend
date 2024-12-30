import mongoose,{Schema} from "mongoose";

const commentSchema = new Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    video : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Videos"
    },
    userComment : {
        type:String
    }
},{timestamps:true})