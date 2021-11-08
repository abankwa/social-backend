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


//GLOBAL LIVE SEARCH RESULTS; while person types
searchRouter.get('/global-search/:searchKey', async (req, res) => {

    const key = req.params.searchKey.trim()

    try {
        const data = await db.query(`SELECT * FROM Person WHERE firstname LIKE $1 ORDER BY firstname ASC LIMIT 10`, [`%${key}%`])
        res.send({ status: 'success', data: data.rows })

        //TODO: code search order for live search. 
        //first friends' firstname, then lastname, then other people, then posts etc etc.
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: 'error' })
    }
})

//FRIEND LIVE SEARCH RESULTS; while person types
searchRouter.get('/friend-search/:searchKey', async (req, res) => {

    const key = req.params.searchKey.trim()

    try {
        const data = await db.query(`SELECT * FROM Person WHERE firstname LIKE $1 ORDER BY firstname ASC LIMIT 10`, [`%${key}%`])
        res.send({ status: 'success', data: data.rows })

        //TODO: code search order for live search. 
        //first friends' firstname, then lastname.
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: 'error' })
    }
})



//TODO: ALL SEARCH RESULTS
//ie when they actually hit enter