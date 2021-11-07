import express, { Router } from 'express'
import db from '../models/postgresDb'
import { verifyUserAuth } from '../middleware/authMiddleware'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { ok } from 'assert'


export const searchRouter = express.Router()

//enable CORS
searchRouter.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

//parse cookies
searchRouter.use(cookieParser())

//parse request body as json
searchRouter.use(express.json())


//LIVE SEARCH RESULTS; while person types
searchRouter.get('/live-search/:searchKey', async (req, res) => {

    const key = req.params.searchKey.trim()

    try {

        //TODO: search from user's friend list first before global users
        
        const data = await db.query(`SELECT * FROM Person WHERE firstname LIKE $1 ORDER BY firstname ASC LIMIT 10`, [`%${key}%`])
        
        res.send({ status: 'success', data: data.rows })

        //TODO: code search order for live search. 
        //first friends' firstname, then lastname, then other people etc.
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: 'error' })
    }


})

//ALL SEARCH RESULTS
//ie when they actually hit enter