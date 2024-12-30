import mongoose,{Schema} from "mongoose";

const likeSchema = new Schema({
    videoLikedByUser : {
        type : mongoose.Schema.Types.ObjectId,
        ref:"Videos"
    },
    commentLikedByUser : {
        type : mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Like = mongoose.model("Like",likeSchema)