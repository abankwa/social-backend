// @ts-nocheck
import express, { Router } from 'express'
import { generateUploadURL, deleteS3Object} from '../middleware/awsS3'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { verifyUserAuth } from '../middleware/authMiddleware'


export const mediaRouter = express.Router()


//enable CORS
mediaRouter.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

//parse cookies
mediaRouter.use(cookieParser())

//parse request body as json
mediaRouter.use(express.json())



//GET SIGNED URL FROM AWS FOR OBJECT PUT
mediaRouter.get('/put-url',verifyUserAuth, async (req, res) => {
    
    try {
        const url = await generateUploadURL()
        res.status(200).send({status:'success', data: url})
    } catch (error) {
        console.log(error)
        res.status(500).send({status:'error', message: error})
    }
})

