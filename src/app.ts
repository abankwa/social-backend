import express from 'express'
import bodyParser from 'body-parser'
require('dotenv').config()
import  connectDb  from '../models/connectDb'
import  { signupRouter } from '../routes/signup'
import { signInRouter } from '../routes/signin'
import { tokenRouter } from '../routes/token'
import { postRouter } from '../routes/post'
import { mediaRouter } from '../routes/media'
import { searchRouter } from '../routes/search'
import { friendRouter} from '../routes/friend'

//connect to db
connectDb();
console.log('from app')

const app = express()
const port: String = process.env.SERVER_PORT || "3000";

app.use('/api', postRouter)

app.use('/auth', signupRouter)

app.use('/auth', signInRouter)

app.use('/auth', tokenRouter)

app.use('/auth', mediaRouter)

app.use('/api', searchRouter)

app.use('/api', friendRouter)

// start server
app.listen(port, ()=>{
    console.log(`running on port ${port}`)
})