import express, { json } from 'express';

import cors from 'cors'

import cookieParser from 'cookie-parser';

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"})) // this is use to set be json limit
app.use(express.urlencoded({extended:true,limit:"16kb"})) // this is use to unecode url 
app.use(express.static("public"))

app.use(cookieParser())
export {app}