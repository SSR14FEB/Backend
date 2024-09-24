require('dotenv').config()
const { configDotenv } = require('dotenv')
const express = require('express')
const app = express()
const port = 3000

const sports={"sports":[{"id":1,"value":"Soccer"},{"id":2,"value":"Basketball"},{"id":3,"value":"Tennis"},{"id":4,"value":"Swimming"},{"id":5,"value":"Cricket"},{"id":6,"value":"Table Tennis"},{"id":7,"value":"Golf"},{"id":8,"value":"Rugby"},{"id":9,"value":"Badminton"},{"id":10,"value":"Baseball"},{"id":11,"value":"Fencing"},{"id":12,"value":"Volleyball"},{"id":13,"value":"Martial Arts"},{"id":14,"value":"Cycling"}]}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/backend',(req,res)=>{
    res.send("Hello backend")
})

app.get('/sports',(req,res)=>{
    res.json(sports)
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})