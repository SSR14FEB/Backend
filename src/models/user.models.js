import mongoose, { Schema } from "mongoose";

import jwt from "jsonwebtoken"

import bcrytjs from "bcryptjs"

const userShema = new Schema(
  {
    userName: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: [true, "user id is required"],
      index: ture,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "email is required"],
    },
    fullName: {
      type: String,
      trim: true,
      required: [true, "user id is required"],
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "video",
      },
    ],
    password: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "password is required"],
    },
    refreshToke: {
      type:String
    }
  },
  { timestamps: true }
);

// passowrd dicrption use of pre hook it is a mongo middleware
userShema.pre("save", async function (next){

  if(!this.isModified("password")) return next();
    this.password = await bcrypt(this.password,10)
    next()

})

// creating methoud to compare the password
userShema.methods.isPasswordCorrect = async function(passowrd){
    return bcrypt.compare(passowrd,this.passowrd)
}

// gentration of access tokens and refresh tokens
userShema.methods.generateAccessToken = function(){
  return jwt.sign(
    {
      _id:this.id,
      email:this.email,
      userName:this.userName,
      fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIREY
    }
  )
}

userShema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
      _id:this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User",userShema)
