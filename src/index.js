// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js";

dotenv.config({
    path:'./env'
})
connectDB()
.then(app.listen(process.env.PORT || 8000),()=>{
    HTMLFormControlsCollection.log(`Server is running at PORT : ${process.env.PORT}`)
})
.catch((err)=>{
    console.log("MONGO db connection Failed!!!!!");
})









/*
import express from "express"

const app=express()
(async ()=>{
    try {
     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
     app.on("error",(error)=>{
        console.log("ERR:",error);
        throw error
     })
     app.listen(process.env.PORT ,()=>{
        console.log(`APP is listening on port ${process.env.PORT}`);
     })
    } catch (error) {
        console.error("Error",error)
        throw err
    }
})()

*/