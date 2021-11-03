import express, { Router } from 'express'
import db from '../models/postgresDb'
import { verifyUserAuth } from '../middleware/authMiddleware'
import { deleteS3Object} from '../middleware/awsS3'
import cors from 'cors'
import cookieParser from 'cookie-parser'


export const friendRouter = express.Router()

//enable CORS
friendRouter.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

//parse cookies
friendRouter.use(cookieParser())

//parse request body as json
friendRouter.use(express.json())


//GET FRIEND DATA
friendRouter.get('/friend/:friendId', verifyUserAuth, async (req, res) => {

    let isFriend;
    const userid = req.userContext.userId
    const friendid = req.params.friendId

    //Verify friendship. 
    try {
        const data = await db.query('SELECT * FROM friend where userid=(LEAST($1,$2))::INT and friendid=(GREATEST($1,$2))::INT',[userid,friendid])
        data.rows.length > 0 ? isFriend = true : isFriend = false;
        console.log(data.rows)
    } catch (error) {
        res.status(500).send({status : "error", message:error})
    }
    
    //get friend details
    try {
        const data = await db.query('SELECT email, firstname, lastname, userid from person WHERE userid = $1',[friendid])
        res.status(200).send({status: 'success', data:[...data.rows,{isFriend:isFriend}] })
    } catch (error) {
        res.status(500).send({status: 'error', message: error})
    }

})

//ADD FRIEND
friendRouter.post('/friend/:friendId', verifyUserAuth, async (req, res) => {

    const userid = req.userContext.userId
    const friendid = req.params.friendId


    try {
        const data = await db.query('CALL insert_friend($1,$2)',[userid,friendid])
        res.status(201).send({status:'success',data: data.rows})
    } catch (error) {
        res.status(500).send({status: 'error', message: error})
    }
})