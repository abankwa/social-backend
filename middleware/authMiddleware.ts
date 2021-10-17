
import jwt from 'jsonwebtoken'
require('dotenv').config()

//verify user is authenticated before accessing protected routes

export  async function  isUserAuthenticated(req, res, next){
    
    const token = req.cookies.accessToken;

    if(token){
        try {
            await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            next()
        } catch (error) {
            res.status(401).send({status: 'unauthorized',message:error})
        }
    } else {
        //token does not exist; early exit
        res.status(401).send({status: 'error', message:'absent token'})
    }
    
}