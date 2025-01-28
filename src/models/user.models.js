import mongoose, { Schema } from "mongoose";

import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";
import { Videos } from "./video.models.js";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: [true, "userName is required"],
      index: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "email is required"],
    },
    phoneNumber:{
      type:Number,
      unique:true
    },
    firstName: {
      type: String,
      trim: true,
      required: [true, "firstName is required"],
      index: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "lastName is required"],
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    about: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    postalCode: {
      type: Number,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Videos",
      },
    ],
    uplodedVideos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Videos",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToke: {
      type: String,
    },
    verifyToken: {
      type: String,
    },
    verifyTokeyExpiry:{
      type:Date
    },
    isVarified:{
      type: Boolean,
      default: false,
    },
    forgetPaswordToken: {
      type: String,
    },
    forgetPaswordTokenExpiry:{
      type: Date
    },
  },
  { timestamps: true }
);

// passowrd dicrption use of pre hook it is a mongo middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// creating methoud to compare the password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// gentration of access tokens and refresh tokens
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this.id,
      email: this.email,
      userName: this.userName,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIREY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
