"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = __importDefault(require("express"));
require('dotenv').config();
const connectDb_1 = __importDefault(require("../models/connectDb"));
const signup_1 = require("../routes/signup");
const signin_1 = require("../routes/signin");
const token_1 = require("../routes/token");
const post_1 = require("../routes/post");
const media_1 = require("../routes/media");
const search_1 = require("../routes/search");
const friend_1 = require("../routes/friend");
const messenger_1 = require("../routes/messenger");
const socket_1 = require("../routes/socket");
const uuid_1 = require("uuid");
//socket.io stuff
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
//connect to db
(0, connectDb_1.default)();
const app = (0, express_1.default)();
//socket.io
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});
//const wss = new WebSocket.Server({server})
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit("chat", { text: 'yolooo', type: 'in', id: (0, uuid_1.v4)() });
    socket.join("room1");
    socket.on("chat", (data) => {
        //socket.emit("chat", {...data,type:'in',id: uuidv4()})
        socket.to('room1').emit("chat", Object.assign(Object.assign({}, data), { type: 'in', id: (0, uuid_1.v4)() }));
        console.log(data);
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
const port = process.env.SERVER_PORT || "4000";
app.use('/api', post_1.postRouter);
app.use('/auth', signup_1.signupRouter);
app.use('/auth', signin_1.signInRouter);
app.use('/auth', token_1.tokenRouter);
app.use('/auth', media_1.mediaRouter);
app.use('/api', search_1.searchRouter);
app.use('/api', friend_1.friendRouter);
app.use('/api', messenger_1.messengerRouter);
app.use('/chat', socket_1.socketRouter);
// // start server
// app.listen(port, ()=>{
//     console.log(`running on port ${port}`)
// })
server.listen(port, () => {
    console.log(`running on port ${port}`);
});
