import {asyncHandler} from "../utils/asyncHandler"
import {apiRespones} from "../utils/apiResponse"
import {apiError} from "../utils/apiError"
import { Like } from "../models/like.models"
import { User } from "../models/user.models"

const likedByUser = asyncHandler(async(req,res)=>{
    const videoId = req.params
    const {likeCount} = req.body

    let liked = true
    if(likeCount % 2 == 0){
        liked = false
    } 
    // coment is temrory suspended
    if(liked){
       const liked = await Like.create({
        videoLikedByUser:videoId,
        user:req.user._id
       }) 
    }
return res.status(200)
.json(new apiRespones(200,liked,"likedButton clicked by user"))
})