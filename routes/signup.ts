import express from 'express'
import connectDb from '../models/connectDb'
import User from '../models/usersModel'
import bcrypt from 'bcrypt'
import randtoken from 'rand-token'
import jwt from 'jsonwebtoken'
require('dotenv').config()
import cors from 'cors'
import cookieParser from 'cookie-parser'
import db from '../models/postgresDb'


export const signupRouter = express.Router()

//MIDDLEWARES
//
//connect to db
signupRouter.use((req, res, next) => {
    connectDb()
    next()
})

//parse request body as json
signupRouter.use(express.json())

//enable CORS
signupRouter.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

//parse cookies
signupRouter.use(cookieParser())



signupRouter.post('/signup', async (req, res) => {
    //TODO: validate input data eg. email format, password length, etc

    //verify email is not already in use
    const data = await User.findOne({ email: req.body.email })
    const data2 = await db.query('SELECT * FROM Person WHERE email=$1',['mail2'])
    console.log(data2.rows[0])
    console.log(data)
    if (data) {
        res.status(400).send({ status: "error", message : 'user exists' })
        return
    }
    //generate password hash
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(req.body.password, salt)

    //generate refresh token
    //const refreshToken = randtoken.generate(20)

    try {
        //create user with refresh token
        const user = await User.create({
            ...req.body,
            password: passwordHash,
            //refreshToken: refreshToken
        })

        //generate JWT access token
        const accessToken = await jwt.sign({
            email: user.email,
            userId: user._id
        }, process.env.ACCESS_TOKEN_SECRET, { 
            expiresIn: 30,
            algorithm: 'HS512'
         })

         //TODO: Genereate id token
        
        //construct user context
        const userContext = {
            userId: user._id,
            email: req.body.email,
            accessToken,
            //refreshToken
        }

        //add access token in httponly cookie
        res.cookie('accessToken',accessToken,{
            httpOnly: true,
            maxAge: 10000000
        })

        //send response
        res.status(201).send({status: "success", data: userContext})
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: "error", message : 'write failed' })
    }

})