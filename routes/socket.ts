// @ts-nocheck
import express, { Router } from 'express'
import db from '../models/postgresDb'
import { verifyUserAuth } from '../middleware/authMiddleware'
import { deleteS3Object } from '../middleware/awsS3'
import cors from 'cors'
import cookieParser from 'cookie-parser'


export const socketRouter = express.Router()

//enable CORS
socketRouter.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

//parse cookies
socketRouter.use(cookieParser())

//parse request body as json
socketRouter.use(express.json())


//messengerRouter.post('/', verifyUserAuth, async (req, res) => {
    socketRouter.get('/', async (req, res) => {
        req.io.emit('chat','yolo bitcheees!')

        res.send({ok:'ok'})

})
