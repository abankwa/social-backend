import express from 'express'
import connectDb from '../models/connectDb'
import jwt from 'jsonwebtoken'
require('dotenv').config()
import cors from 'cors'
import cookieParser from 'cookie-parser'
import jwtDecode from 'jwt-decode'

export const tokenRouter = express.Router()

//MIDDLEWARES
//
// //connect to db      //MONGODB
// tokenRouter.use((req, res, next) => {
//     connectDb();
//     next()
// })

//parse request body
tokenRouter.use(express.json())

//enable CORS
tokenRouter.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

//parse cookies in req
tokenRouter.use(cookieParser())

//verify and/or renew token
tokenRouter.get('/token/verify', async (req, res) => {

    //check cookie presence; early exit
    if (typeof (req.cookies['accessToken']) === 'undefined') {
        res.status(400).send({ status: "error", message: 'missing token' })
        return
    }


    try {
        const accessToken = await req.cookies['accessToken']
        const verified = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        //decode token
        const x = jwtDecode(req.cookies['accessToken'])

        //construct user context
        const userContext = {
            userId: x.userId,
            email: x.email,
            firstName: x.firstName,
            lastName: x.lastName,
            accessToken: accessToken
        }


        res.status(200).send({ status: "success", data: userContext })

    } catch (error) {

        //renew expired token
        if (error.name === 'TokenExpiredError') {

            // decode token
            const decoded = jwtDecode(req.cookies['accessToken'])

            //generate new token
            const newAccessToken = await jwt.sign({
                email: decoded.email,
                userId: decoded.userId,
                firstName: decoded.firstName,
                lastName: decoded.lastName
            }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: 30,
                algorithm: 'HS512'
            })

            //construct user context
            const userContext = {
                userId: decoded.userId,
                email: decoded.email,
                accessToken: newAccessToken
            }

            //add access token in httponly cookie
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                maxAge: 1000000
            })

            res.status(200).send({ status: 'success', data: userContext })

            // invalid token
        } else {
            res.status(400).send({ status: "error", message: "invalid token" })
        }
    }
})
