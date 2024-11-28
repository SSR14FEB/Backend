import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"
const registerUser = asyncHandler(async(req,res)=>{
  // LOGIC 
  // Get dtails from user
  // Valdation - not empty
  // Check, is user allready exists
  // Check, Avtar image
  // Upload avtar or cover image  on cloudinary 
  // Create object from - creat entry on db
  // Remove password from refresh token field from response
  // Check user creation 
  // Return response

  const {fullName, email, userName, password} = req.body
  
  if([fullName, email, userName, password].some((fields)=>
  fields?.trim()=="")){
  throw apiError(400,"All fields are requierd")
  }

  const existedUser =await User.findOne({
    $or:[{userName},{email}]
  })

  if(existedUser){
    throw new apiError(409,"user or email already existed")
  }
  
  console.log("reqested file",req.files)

  const localAvatarPath = req.files?.avatar[0]?.path
  let localcoverImagePath = null
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
  localcoverImagePath = req.files?.coverImage[0]?.path
  }

  if(!localAvatarPath){
    throw new apiError(400,"Avatar is required")
  }

  const avatar = await uploadOnCloudinary(localAvatarPath)
  const coverImage = await uploadOnCloudinary(localcoverImagePath)

  

  if(!avatar){
    throw new apiError(400,"Avatar is required")
  }

  const user = await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    userName:userName.toLowerCase(),
    email,
    password
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!user){
    throw new apiError(500,"Something went wrong while registering user")
  }

  return res.status(200).json(
    new apiResponse(200,createdUser,"User registerd successfully")
  )
})

export {registerUser}