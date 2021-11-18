// @ts-nocheck
import express, { Router } from 'express'
import db from '../models/postgresDb'
import { verifyUserAuth } from '../middleware/authMiddleware'
import { deleteS3Object } from '../middleware/awsS3'
import cors from 'cors'
import cookieParser from 'cookie-parser'


export const messengerRouter = express.Router()

//enable CORS
messengerRouter.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

//parse cookies
messengerRouter.use(cookieParser())

//parse request body as json
messengerRouter.use(express.json())

//GET CONVERSATION GIVEN A PARTICIPANT LIST
messengerRouter.post('/conversation-given-members', verifyUserAuth, async (req, res) => {

    const userid = req.userContext.userId
    const participants = [...req.body.data, userid]
    const count = participants.length

    console.log(participants)

    try {
        //get the single conversationid that these participant are a part of
        const data1 = await db.query(`select conversationid from conversation_participant where participantid = ANY($1::int[]) group by conversationid having count(conversationid) = $2`, [participants, count])
        console.log(data1.rows)

        //check the number of participants in this conversation

        if (data1.rows.length > 0) {
            const data2 = await db.query('select count(*) from conversation_participant where conversationid = $1', [data1.rows[0].conversationid])
            console.log(data2.rows)
            //confirm that these participants are the only people in the conversation. prevents matching of conversations where participants are only a subset
            if (parseInt(data2.rows[0].count) === count) res.send({ status: 'success', data: data1.rows })
            else res.send({ status: 'success', data: [] })
        } else res.send({ status: 'success', data: [] })

    } catch (error) {
        res.status(500).send({ status: 'error', error: error })
    }
})


//GET MESSAGES GIVEN A CONVERSATION ID
messengerRouter.get('/messages/:conversationid', verifyUserAuth, async (req, res) => {
    const userid = req.userContext.userId
    console.log('testing here.again..')

    try {
        const data = await db.query('select * from chatmessage where conversationid = $1', [req.params.conversationid])
        console.log(data.rows)
        res.status(200).send({ status: 'success', data: data.rows })
    } catch (error) {
        res.status(500).send({ status: 'error', message: error })
    }

})

//GET ALL CONVERSATIONS
messengerRouter.get('/conversations', verifyUserAuth, async (req, res) => {

    try {
        const data = await db.query('select * from conversation',[])
        res.status(200).send({status: 'success', data: data.rows})
    } catch (error) {
        res.status(500).send({status: 'error', message: error})
    }
})

//ADD CHAT MESSAGE
messengerRouter.post('/message', verifyUserAuth, async (req, res) => {
    const userid = req.userContext.userId
    const {conversationid, messagetext} = req.body

    //req.io.emit('chat','yolo bitcheees!')

    console.log(req.params)
   try {
       const data = await db.query('insert into chatmessage(conversationid, senderid, messagetext) values($1,$2,$3)',[conversationid,userid,messagetext])
       res.status(201).send({status: 'success', data: data.rows})
   } catch (error) {
       res.status(500).send({status: 'error', message: error})
   }
})

//CREATE NEW CONVERSATION WITH MESSAGE
messengerRouter.post('/conversation-with-message', verifyUserAuth, async (req, res) => {

    const userid = req.userContext.userId
    console.log(req.body)
    const members = [...req.body.chatMembers,userid]
    const message = req.body.messagetext

    //TOO: use postgres transactions for below operation

    try {
        //1. create new conversation
        const data1 = await db.query('insert into conversation default values  returning conversationid',[])
        const conversationid = data1.rows[0].conversationid

        //2. add members to conversation_participant table
        members.map(async member => {
            await db.query('insert into conversation_participant (conversationid,participantid) values($1,$2)',[conversationid,member])
        })
        //3. add the message
        await db.query('insert into chatmessage(conversationid, senderid, messagetext) values($1,$2,$3)',[conversationid,userid,message])
    
        res.status(201).send({status:'success', data: data1.rows})
        
    } catch (error) {
        res.status(400).send({status: 'error', message: error})
    }

})
