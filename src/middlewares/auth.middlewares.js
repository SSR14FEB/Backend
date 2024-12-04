import { apiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.models";
import jwt from "jsonwebtoken"

export const jwtValidation = asyncHandler(async(req,res,next)=>{

    const token = req.cookie?.accessToken || req.hadder("Authorization")?.replace("Bearer ","")

    if(!token){
        throw new apiError(401, "Unauthorized request")
    }

   const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET)

   const user = await User.findById(decodedToken._id)
   .select("-password, refreshToken")

   if(!user){
    throw new apiError(401, "invalid Access Token")
   }
    
   req.user = user
   next()
   
})