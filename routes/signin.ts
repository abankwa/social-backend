// @ts-nocheck
import express, { Router } from 'express'
import connectDb from '../models/connectDb'
import bcrypt from 'bcrypt'
import User from '../models/usersModel'
import jwt from 'jsonwebtoken'
import db from '../models/postgresDb'



export const signInRouter = express.Router()

//MIDDLEWARES
//
// //connect to db
// signInRouter.use((req, res, next) => {
//     connectDb()
//     next()
// })

//parse request body as json
signInRouter.use(express.json())

//parse cookies
//signInRouter.use(cookieParser())


//SIGN IN
signInRouter.post('/signin', async (req, res) => {

    try {
        //verify user email exists

        //const user = await User.findOne({email: req.body.email}) MONGODB

        const user = await db.query('SELECT * FROM Person WHERE email=$1',[req.body.email])
        
        if(!user.rows[0]) res.status(401).send({status: "error" ,message : "user not found"})

        //verify password
        const isPasswordSame = await bcrypt.compare(req.body.password, user.rows[0].userpassword)

        if(isPasswordSame) {

            //generate JWT access token
            const accessToken = await jwt.sign({
                //email: user.email, MONGODB
               // userId: user._id MONGODB
               userId: user.rows[0].userid,
               email: user.rows[0].email,
               firstName: user.rows[0].firstname,
               lastName: user.rows[0].lastname,
            }, process.env.ACCESS_TOKEN_SECRET, { 
                expiresIn: 30,
                algorithm: 'HS512'
             })

            //construct user context
            const userContext = {
                //userId: user._id, MONGODB
                userId: user.rows[0].userid,
                email: user.rows[0].email,
                firstName: user.rows[0].firstname,
                lastName: user.rows[0].lastname,
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