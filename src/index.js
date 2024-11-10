import dotenv from 'dotenv'

import connectDB from './db_connection/index.js'
import { app } from './app.js'

dotenv.config({
    path:'./env'
})

//MONGODB CONNECTION 
connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
    console.log(`SERVER IS RUNNIG ON PROT || ${process.env.PORT}`)
})
    app.on("error",(error)=>{
    console.log(`MONGODB CONNECTION ERROR || ${error}`)
})
})
.catch((error)=>{
    console.log(`MONGODB CONNECTION FAILD || ${error}`);
    process.exit(1)
})
