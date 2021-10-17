import express, { Router } from 'express'
import connectDb from '../models/connectDb'
import bcrypt from 'bcrypt'
import User from '../models/usersModel'
import jwt from 'jsonwebtoken'
import db from '../models/postgresDb'



export const signInRouter = express.Router()

//MIDDLEWARES
//
//connect to db
signInRouter.use((req, res, next) => {
    //console.log('from sign in')
    connectDb()
    next()
})

//parse request body as json
signInRouter.use(express.json())

//parse cookies
//signInRouter.use(cookieParser())


//SIGN IN
signInRouter.post('/signin', async (req, res) => {

    try {
        //verify user email exists

        const user = await User.findOne({email: req.body.email})
        
        if(!user) res.status(401).send({status: "error" ,message : "user not found"})

    
        //verify password
        const isPasswordSame = await bcrypt.compare(req.body.password, user.password)

        if(isPasswordSame) {

            //generate JWT access token
            const accessToken = await jwt.sign({
                email: user.email,
                userId: user._id
            }, process.env.ACCESS_TOKEN_SECRET, { 
                expiresIn: 30,
                algorithm: 'HS512'
             })

            //construct user context
            const userContext = {
                userId: user._id,
                email: req.body.email,
                accessToken
            }

            //add access token in httponly cookie
            res.cookie('accessToken',accessToken, {
                httpOnly: true,
                maxAge: 1000000
            })

            //send resonponse
            res.status(200).send({status: "success", data: userContext})
        }
        else res.status(401).send({status: "error", message: "password mismatch"})
        
    } catch (error) {
        res.status(500).send({status: "error", message: error})
    }
    
})

//SIGN OUT
signInRouter.post('/signout', (req,res) => {
    res.clearCookie('accessToken', {path: '/'})
    res.status(200).send({status: "success", message: "signout success"})
})