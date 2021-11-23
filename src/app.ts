// @ts-nocheck
import express from 'express'
import bodyParser from 'body-parser'
require('dotenv').config()
import connectDb from '../models/connectDb'
import { signupRouter } from '../routes/signup'
import { signInRouter } from '../routes/signin'
import { tokenRouter } from '../routes/token'
import { postRouter } from '../routes/post'
import { mediaRouter } from '../routes/media'
import { searchRouter } from '../routes/search'
import { friendRouter } from '../routes/friend'
import { messengerRouter } from '../routes/messenger'
import { socketRouter } from '../routes/socket'
import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid';



//socket.io stuff
import http from 'http'
import { Server } from 'socket.io'

//connect to db
connectDb();
const app = express()

//socket.io
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
})

//const wss = new WebSocket.Server({server})

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit("chat", {text: 'yolooo',type:'in',id: uuidv4()})
    socket.join("room1");

    socket.on("chat", (data) => {
        //socket.emit("chat", {...data,type:'in',id: uuidv4()})
        socket.to('room1').emit("chat", {...data,type:'in',id: uuidv4()})
        console.log(data)
    });
});

// wss.on('connection',(ws) => {
//     //console('new connection bitches')
//     ws.send('new websocket bitches')

// })

//pass socket io to express routers
app.use((req, res, next) => {
    req.io = io;
    return next();
});

// app.use((req,res,next) => {
//     req.wss = wss;
//     return next();
// })
  


const port: String = process.env.SERVER_PORT || "4000";

app.use('/api', postRouter)

app.use('/auth', signupRouter)

app.use('/auth', signInRouter)

app.use('/auth', tokenRouter)

app.use('/auth', mediaRouter)

app.use('/api', searchRouter)

app.use('/api', friendRouter)

app.use('/api', messengerRouter)

app.use('/chat', socketRouter)


// // start server
// app.listen(port, ()=>{
//     console.log(`running on port ${port}`)
// })

server.listen(port, () => {
    console.log(`running on port ${port}`)
});