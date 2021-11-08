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



//VERIFY FRIENDSHIP STATUS
friendRouter.get('/verify-friend/:friendId', verifyUserAuth, async (req, res) => {

    let isFriend
    let friendRequestStatus = 'none' /* NONE: friend request not sent
                                        SENT: user has sent a friend request
                                        RECEIVED: user has received a friend request */
    const userid = req.userContext.userId
    const friendid = req.params.friendId

    //check friend table
    try {
        const data = await db.query('SELECT * FROM friend where userid=(LEAST($1,$2))::INT and friendid=(GREATEST($1,$2))::INT',[userid,friendid])
        data.rows.length > 0 ? isFriend = true : isFriend = false ;
    } catch (error) {
        res.status(500).send({status : "error", message:error})
    }

    //check friendRequest table if user has sent a request to friend
    try {
        const data = await db.query('SELECT * FROM friendrequest WHERE requesterid=$1 AND receiverid=$2',[userid,friendid])
        
        if(data.rows.length > 0){
            friendRequestStatus = 'sent'
            res.status(200).send({status:'success', data:{isFriend,friendRequestStatus}})
            return
        }
    } catch (error) {
        res.status(500).send({status : "error", message:error})
        return
    }

    //check friendRequest table if friend has sent a request to user
    try {
        const data = await db.query('SELECT * FROM friendrequest WHERE requesterid=$1 AND receiverid=$2',[friendid,userid])
        
        if(data.rows.length > 0){
            friendRequestStatus = 'received'
            res.status(200).send({status:'success', data:{isFriend,friendRequestStatus}})
            return
        }

    } catch (error) {
        res.status(500).send({status : "error", message:error})
        return
    }

    //no friend request has been sent/received
    res.status(200).send({status:'success', data:{isFriend,friendRequestStatus}})

})


//ACCEPT FRIEND REQUEST. add entry into friend table, delete friendRequest entry
friendRouter.post('/accept-friend/:friendId', verifyUserAuth, async (req, res) => {

    const userid = req.userContext.userId
    const friendid = req.params.friendId

    try {
        //TODO: use sql transaction

        // add entry into friend table
        const data = await db.query('CALL insert_friend($1,$2)',[userid,friendid])

        // delete friend request entry from friendrequest table
        await db.query('DELETE FROM friendrequest WHERE requesterid=$1 AND receiverid=$2',[friendid,userid])

        res.status(201).send({status:'success',data: data.rows})
    } catch (error) {
        res.status(500).send({status: 'error', message: error})
    }
})

//REJECT FRIEND REQUEST. delete the request entry from friendrequest table
friendRouter.post('/reject-friend/:friendId', verifyUserAuth, async (req, res) => {
    const userid = req.userContext.userId
    const friendid = req.params.friendId

    try { 
        const data = await db.query('DELETE FROM friendrequest WHERE requesterid=$1 AND receiverid=$2',[friendid,userid])
        res.status(201).send({status:'success',data: data.rows})
    } catch (error) {
        res.status(500).send({status: 'error', message: error})
    }

})


//SEND FRIEND REQUEST. add entry into friendrequest table
friendRouter.post('/request-friend/:friendId', verifyUserAuth, async (req, res) => {
    const userid = req.userContext.userId
    const friendid = req.params.friendId

    try {
        const data = await db.query('INSERT INTO friendrequest(requesterid, receiverid) VALUES($1,$2)',[userid,friendid])
        res.status(201).send({status:'success',data: data.rows})
    } catch (error) {
        console.log(error)
        res.status(500).send({status: 'error', message: error})
    }

})


//GET FRIEND REQUESTS + Sender details
friendRouter.get('/friend-requests', verifyUserAuth, async (req, res) => {
    const userid = req.userContext.userId

    try {
        const data = await db.query('SELECT person.firstname, person.lastname,person.userid FROM friendrequest INNER JOIN person ON friendrequest.requesterid = person.userid WHERE friendrequest.receiverid = $1',[userid]);
        res.status(200).send({status: 'success', data:data.rows})
    } catch (error) {
        res.status(500).send({status: 'error', message: error})
    }

})

//GET FRIEND DATA
friendRouter.get('/friend/:friendId', verifyUserAuth, async (req, res) => {

    let isFriend;
    const userid = req.userContext.userId
    const friendid = req.params.friendId
    
    try {
        const data = await db.query('SELECT email, firstname, lastname, userid from person WHERE userid = $1',[friendid])
        res.status(200).send({status: 'success', data:data.rows })
    } catch (error) {
        res.status(500).send({status: 'error', message: error})
    }

})

//GET ALL FRIENDS 
friendRouter.get('/friends', verifyUserAuth, async (req, res) => {


    const userid = req.userContext.userId
    
    try {
        const data = await db.query('SELECT person.email, person.firstname, person.lastname, person.userid FROM friend INNER JOIN person ON friend.friendid = person.userid WHERE friend.userid = $1',[userid])
        console.log(data.rows)
        res.status(200).send({status: 'success', data:data.rows })
    } catch (error) {
        res.status(500).send({status: 'error', message: error})
    }

})