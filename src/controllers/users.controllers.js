import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"

const generateAccessTokenAndRefreshToken = async (userId) =>{
try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refershToken = user.generateRefreshToken()

    user.refershToken = refershToken
    await user.save({ validateBeforeSave : false })
    return { accessToken, refershToken }

} catch (error) {
  throw new apiError(500,"Something went wrong while genrating refreshToken and accessToken")
}
}

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

  const existedUser = await User.findOne({
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

const logInUser = asyncHandler(async(req,res)=>{
  // req body -> Data
  // userName or email(login confingration)
  // find user
  // passowrd check
  // accessToken or refershToken (Genration)
  // send cookies

  const {userName, email, password} = req.body
  
  console.log(email,password)
  if(!(userName||email)){
    throw new apiError(400,"User name or email is required ")
  }

  const user = await User.findOne({
      $or:[{userName}, {email}]
    })
    if(!user){
      throw new apiError(404,"User dose not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    
    console.log(isPasswordValid)

  if(!isPasswordValid){
    throw new apiError(401,"Invalid user credentails")
  }

 const { accessToken, refershToken } = await generateAccessTokenAndRefreshToken(user._id)

 const logedInUser = await User.findById(user._id).
 select("-refershToken -password")

const option = {
  httpOnly:true,
  secure:true
}

return res.status(200)
.cookie("accessToken",accessToken,option)
.cookie("refreshToken",refershToken,option)
.json(
  new apiResponse(
    200,{
      user:logInUser,accessToken,refershToken
    },
    "Loged in successfully"
  )
)

})

const logOutUser = asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(req.user._id,{
    refershToken:undefined
  },
  {
    new:true
  }
) 

const option = {
  httpOnly:true,
  secure:true
}

return res.status(200)
.clearCookie("accessToken",option)
.clearCookie("refershToken",option)
.json(apiResponse(200,{},"User loged out successfully"))
})

export {
  registerUser,
  logInUser,
  logOutUser
}