import {aysncHandler} from '../utils/asyncHandler.js'
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js'

const generateAccessAndRefreshTokens = async(userid) => {
  try {
    const user = await User.findById(userid)
   const accessToken = user.generateAccessToken()
   const refreshToken = user.generateRefreshToken()

   user.refreshToken = refreshToken
   await user.save({ validateBeforeSave: false })
 
   return {accessToken ,refreshToken}

  } catch (error) {
   throw new ApiError(500 ,"Something went wrong while generating refresh and access token ") 
  }
}

const registerUser = aysncHandler(async (req,res) =>{
 // get user cetail from frontend
 const {fullName , username ,email ,password }= req.body
console.log("email", email);

// console.log("req.body", req.body);

if ([fullName,email ,password,username].some((field)=>field?.trim() === ""))
    {
        throw new ApiError(400,"all filed are required")
    }

   const existedUser= await User.findOne({
        $or :[{username},{email}]
    })
    if(existedUser)
        {
            throw new ApiError(409,"User with email anf username already exists")
        }

      const avatarLocalPath =  req.files?.avatar[0]?.path;
    //   const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // console.log("req.file",req.files);

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

      if(!avatarLocalPath)
        {
         throw new ApiError(400,"Avatar file is required")
        }
const avatar = await uploadOnCloudinary(avatarLocalPath);
const coverImage = await uploadOnCloudinary(coverImageLocalPath);

if(!avatar)
    {
        throw new ApiError(400,"Avatar file is required")
    }

  const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

  const createdUser =  await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if(!createdUser)
    {
        throw new ApiError(500,"Somethimg went wrong while registering the useer")
    }

    return res.status(201).json(
        new ApiResponse(200 , createdUser ,"user register successfully")
    )
 // validation - not empty

 // check if user already exists : username , email

 //check for images , check for avatar

 // upload then to cloudinary , avatar

 //create user object - entry in db

 //remove password and refresh token field from response

 //check for user creation

 //return res 
})

const loginUser = aysncHandler(async (req, res) =>{
//req body -> data
// username or email
// find the user 
// password check
// access and refresh token
// send cookie

const { email,username,password} = req.body
if(!username || !email)
  {
    throw new ApiError(400, "username or password is required")
  }

 const user = await User.findOne({
    $or:[{username},{email}]
  })

  if(!user)
    {
      throw new ApiError(404, "User does not exists")
    }

   const isPasswordValid= await user.isPasswordCorrect(password)
    if(!isPasswordValid)
      {
        throw new ApiError(404 ,"user Does not exist")
      }
   const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id)
  
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options ={
    httpOnly : true,
    secure : true,
   }
   return res.status(200).cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken ,options)
   .json(
    new ApiResponse (200,
      {
        user:loggedInUser,accessToken,refreshToken
      },
      "User Logged in SuccessFully"
    )
  )

  })

  const logoutUser= aysncHandler(async(req , res) =>{
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken : undefined
        }
      },
      {
        new :true
      }
    )
    const options ={
      httpOnly : true,
      secure : true,
     }

     return res
     .status(200)
     .clearCookie("accessToken" ,options)
     .clearCookie("refreshToken" ,options)
     .json(new ApiResponse(200,{},"user logged Out"))
  })

export{registerUser,logoutUser,loginUser}