import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt, { decode } from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refershToken = user.generateRefreshToken();

    user.refershToken = refershToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refershToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while genrating refreshToken and accessToken"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
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

  const { fullName, email, userName, password } = req.body;

  if (
    [fullName, email, userName, password].some((fields) => fields?.trim() == "")
  ) {
    throw apiError(400, "All fields are requierd");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "user or email already existed");
  }

  console.log("reqested file", req.files);

  const localAvatarPath = req.files?.avatar[0]?.path;
  let localcoverImagePath = null;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    localcoverImagePath = req.files?.coverImage[0]?.path;
  }

  if (!localAvatarPath) {
    throw new apiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(localAvatarPath);
  const coverImage = await uploadOnCloudinary(localcoverImagePath);

  if (!avatar) {
    throw new apiError(400, "Avatar is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    userName: userName.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new apiError(500, "Something went wrong while registering user");
  }

  return res
    .status(200)
    .json(new apiResponse(200, createdUser, "User registerd successfully"));
});

const logInUser = asyncHandler(async (req, res) => {
  // req body -> Data
  // userName or email(login confingration)
  // find user
  // passowrd check
  // accessToken or refershToken (Genration)
  // send cookies

  const { userName, email, password } = req.body;

  console.log(email, password);
  if (!(userName || email)) {
    throw new apiError(400, "User name or email is required ");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!user) {
    throw new apiError(404, "User dose not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  console.log(isPasswordValid);

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid user credentails");
  }

  const { accessToken, refershToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const logedInUser = await User.findById(user._id).select(
    "-refershToken -password"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refershToken", refershToken, option)
    .json(
      new apiResponse(
        200,
        {
          user: logInUser,
          accessToken,
          refershToken,
        },
        "Loged in successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset:{
        refershToken: 1 //this remove refreshToken from midilware
      }
    },
    {
      new: true,
    }
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refershToken", option)
    .json(new apiResponse(200, {}, "User loged out successfully"));
});

const refershAcessToken = asyncHandler(async(req,res)=>{
  const incomingRefreshToken = req.cookies?.refershToken || req.body?.refershToken
  if(incomingRefreshToken != refershAcessToken ){
    throw new apiError(401,"Unauthrised refresh roken")
  }
  try {
    const decodeToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
    const user = User.findById(decodeToken._id)
    if(!user){
      throw new apiError(401,"invalid refresh token or all ready use Refresh Token")
    }
  
    const  {refershToken,accessToken} = await generateAccessTokenAndRefreshToken(req.user._id)
  
    const option = {
      httpOnly:true,
      secure:true
    }
    return res.status(200)
    .cookies("acessToken", accessToken, option)
    .cookies("aefreshToken", refershToken, option)
    .json(new apiResponse(200,{
      accessToken,
      refershToken
    },"new AcessToken and RefreshToken genrated"))
  
  } catch (error) {
    throw new apiError(500,error?.massage || "invalid Refresh Token")
  }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const {newPassword, confirmPassword, oldPassword} = req.body
  if(newPassword!=confirmPassword){
    throw new apiError(401,"Passord did not match")
  }
  
  const user = User.findById(req.user._id)
  const isPasswrodValid = await user.confirmPassword(oldPassword)

  if(!isPasswrodValid){
    throw new apiError(400,"invalid password ")
  }

  user.password = newPassword
  await user.save({validateBeforeSave:false})

  return res.status(200)
  .json(
    new apiResponse(200, {}, "Current password changed successfully")
  )

})

const currentUser = asyncHandler(async(req,res)=>{
  return req.status(200)
  .json(200,req.user,"current user fetched successfully")
})

const upadteAccountDetalis = asyncHandler(async(req,res)=>{
  const { fullName, email } = req.body

  if([fullName, email].some((filds)=>{
    filds?.trim()==" "
  })){
    return new apiError(400,"all fields are required")
  }

  const user = await User.findByIdAndUpdate(req.user._id, {
    $set:{
      fullName:fullName,
      email:email
    }
  },{new:true}).select("-password")

  return req.status(200)
  .json(new apiResponse(200,user, "user detalis updated"))
})

const updatedUserAvatar = asyncHandler(async(req,res)=>{
  const localAvatarPath= req.file?.path
  if(!localAvatarPath){
    throw new apiError(400,"Avatar is required")
  }

  const avatar = await uploadOnCloudinary(localAvatarPath)
  if(!avatar.url){
    throw new apiError(400, "Error while uploading avatar")
  }

  const user = await User.findByIdAndUpdate(req.userId._id,
    {$set:
      {avatar:avatar.url}
  },{new:true}.select("-password")
)

  return res.status(200)
  .json(new apiResponse(200,user,"avatar updated successfully"))

})

const updatedUserCoverIamger = asyncHandler(async(req,res)=>{
  const localCoverImagePath = req.file?.path
  if(!localCoverImagePath){
    throw new apiError(400,"coverImage is required")
  }

  const coverImage = await uploadOnCloudinary(localCoverImagePath)
  if(!coverImage.url){
    throw new apiError(400, "Error while uploading avatar")
  }

  const user = await User.findByIdAndUpdate(req.userId._id,
    {$set:
      {coverImage:coverImage.url}
  },{new:true}.select("-password")
)

  return res.status(200)
  .json(new apiResponse(200,user,"coverImage updated successfully"))

})

const getUserChanelProfile = asyncHandler(async(req,res)=>{
  const {userName} = req.params
  if(!userName?.trim()){
    throw new apiError(400,"user not found")
  }

 const channel = await User.aggregate([
  {
    $match:{
      userName:userName?.toLowerCase()
    }
  },
  {
    $lookup:{
      form:"sububscriptions",
      localField:"_id",
      foreignField:"channel",
      as:"Subuscribers"
    }
  },
  {
    $lookup:{
      form:"sububscriptions",
      localField:"_id",
      foreignField:"subuscriber",
      as:"subuscriberTo"
    }
  },
  {
    $addFields:{
      subuscribersCount:{
        $size:"$Subuscribers"
      },
      chanelSubuscribeToCount:{
        $size:"$subuscribeTo"
      }
    }
  },
  {
    isSubuscribed:{
      $cond:{
        if:{$in:[req.user?._id,"$subuscribers.subuscriber"]},
        then:true,
        else:false
      }
    }
  },
  {
    $project:{
      fullName:1,
      userName:1,
      email:1,
      avatar:1,
      coverImage:1,
      subuscribersCount:1,
      chanelSubuscribeToCount:1,
      isSubuscribed:1,

    }
  }
 ])

 if(!channel.length){
  throw new apiError(404,"chanel not found")
 }

 return req.status(200)
.json(new apiResponse(200,channel[0],"User chanel fetched successfully"))
})

const getUserWatchHistory = asyncHandler(async(req,res)=>{
const user = await User.aggregate([
    {
      $match : {
        _id : new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup : {
        from : "videos",
        localField : "watchHistory",
        foreignField : "_id",
        as : "watchHistory",
        pipeline : [{
            $lookup : {
              from : "users",
              localField : "owner",
              foreignField : "_id",
              as : "owner",
              pipeline : [{
                  $project : [{
                    avatar : 1,
                    userName : 1,
                    fullName : 1,
                    email : 1,
                },{
                  $addFields :{
                    owner : {
                      $first : "$owner"
                    }
                  }
                }]
            }]
          }
        }]
      }
    }
   ])

   return req.status(200)
   .json(new apiResponse(200,user[0].WatchHistory,"User watch history"))
})

export { 
  registerUser, 
  logInUser, 
  logOutUser,
  refershAcessToken,
  changeCurrentPassword,
  currentUser,
  upadteAccountDetalis,
  updatedUserAvatar,
  updatedUserCoverIamger,
  getUserChanelProfile,
  getUserWatchHistory
  };
