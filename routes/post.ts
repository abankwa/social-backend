import express, { Router } from 'express'
import db from '../models/postgresDb'
import { isUserAuthenticated } from '../middleware/authMiddleware'
import cors from 'cors'
import cookieParser from 'cookie-parser'


export const postRouter = express.Router()

//enable CORS
postRouter.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

//parse cookies
postRouter.use(cookieParser())


postRouter.get('/posts', isUserAuthenticated, async (req, res) => {

    try {
        const data = await db.query('SELECT * FROM table1',[])
        console.log(data.rows)
        res.status(200).send({status: 'success', data: data})
    } catch (err){
        console.log(err)
        res.status(500).send({status: 'error', error:err})
    }

})