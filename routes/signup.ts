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
// //connect to db      MONGODB
// signupRouter.use((req, res, next) => {
//     connectDb()
//     next()
// })

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

    
    const { email, password, firstName, lastName } = req.body

    console.log(req.body)
    //verify email is not already in use
    //const data = await User.findOne({ email: req.body.email })// MONGO
    const data = await db.query('SELECT * FROM Person WHERE email=$1', [email])

    //if (data) { //MONGO
    if (data.rows[0]) {
        res.status(400).send({ status: "error", message: 'user exists' })
        return
    }
    //generate password hash
    let passwordHash
    try {
        const salt = await bcrypt.genSalt(10)
        passwordHash = await bcrypt.hash(password, salt)
    } catch (error) {
        console.log(error)
        res.status(500).send({status: 'error', message: error})
    }
    

    try {
        //create user 
        // const user = await User.create({     // MONGODB
        //     ...req.body,
        //     password: passwordHash,
        // })

        await db.query('INSERT INTO Person (email,userpassword,firstname,lastname) VALUES ($1,$2,$3,$4)', [email, passwordHash, firstName, lastName])
        const user = await db.query('SELECT * FROM Person WHERE email=$1', [req.body.email])

        //generate JWT access token
        const accessToken = await jwt.sign({
            userId: user.rows[0].userid,
            email: user.rows[0].email,
            firstName: user.rows[0].firstname,
            lastName: user.rows[0].lastname,
            //userId: user._id  // MONGO
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: 30,
            algorithm: 'HS512'
        })

        //TODO: Genereate id token

        //construct user context
        const userContext = {
            //userId: user._id,     // MONGODH
            userId: user.rows[0].userid,
            email: user.rows[0].email,
            firstName: user.rows[0].firstname,
            lastName: user.rows[0].lastname,
            accessToken,
        }

        //add access token in httponly cookie
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 10000000
        })

        //send response
        res.status(201).send({ status: "success", data: userContext })
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: "error", message: 'write failed' })
    }

})