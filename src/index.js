import dotenv from 'dotenv'

import connectDB from './db_connection/index.js'

dotenv.config({
    path:'./env'
})

connectDB()