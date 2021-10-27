import express, { Router } from 'express'
import db from '../models/postgresDb'
import { verifyUserAuth } from '../middleware/authMiddleware'
import { deleteS3Object} from '../middleware/awsS3'
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

//parse request body as json
postRouter.use(express.json())

//GET ALL POSTS BY USER
postRouter.get('/user/:userId/posts', verifyUserAuth, async (req, res) => {
//postRouter.get('/user/:userId/posts', async (req, res) => {
    try {
        const data = await db.query('SELECT * FROM Post WHERE personid = $1 ORDER BY postdate DESC', [req.params.userId])
        res.status(200).send({ status: 'success', data: data.rows })
    } catch (err) {
        res.status(500).send({ status: 'error', error: err })
    }

})

//GET POST BY ID
postRouter.get('/posts/:postId', verifyUserAuth, async (req, res) => {
    try {
        const {postId} = req.params
        const data = await db.query('SELECT * FROM Post WHERE PostId = $1',[postId])
        res.status(200).send({data: data.rows})
    } catch (err){
        res.status(500).send({status: 'error', message: err})
    }
})

//CREATE POST
postRouter.post('/post', verifyUserAuth, async (req, res) => {
//postRouter.post('/post', async (req, res) => {
    try {
        const { postText, personId, mediaURL } = req.body
        const data = await db.query('INSERT INTO Post (postText, personId, mediaUrl) VALUES ($1,$2,$3)', [postText, personId, mediaURL])
        res.status(201).send({ status: 'success' })
        console.log('success')
    } catch (error) {
        res.status(500).send({ status: 'error', error })
        console.log(error)
    }

    //TODO: determine personId before inserting into Post
})

//DELETE POST BY USER
postRouter.delete('/post', verifyUserAuth, async (req, res) => {
//postRouter.delete('/post', async (req, res) => {
    try {
        //delete post from database
        const { personid, postid} = req.body
        console.log(req.body)
        const data = await db.query('DELETE FROM Post WHERE postid=$1 AND personid=$2',[postid,personid])

        //delete image from S3 
        const out = deleteS3Object(req.body.mediaurl.split('/')[3])
        res.status(200).send({status: 'success'})
    } catch(error){
        console.log(error)
        res.status(500).send({status: 'error', error})
    }
})

//UPDATE POST BY USER

//GET USER FEED
//use some algo to determine what posts from user's friend's or content subscriptions to show 
//on their feed