
import jwt from 'jsonwebtoken'
require('dotenv').config()
import jwtDecode from 'jwt-decode'

//verify user is authenticated before accessing protected routes


//verify and/or renew token
export  async function  verifyUserAuth(req, res, next){

    //absent token; deny; early exit
    if (typeof (req.cookies['accessToken']) === 'undefined') {
        res.status(400).send({ status: "error", message: 'missing token' })
        return    
    }

    // decode token to and add to request as userContext. ensures all protected routes know the 
    // user making requests
    const decoded = jwtDecode(req.cookies['accessToken'])
    req.userContext = decoded


    //valid token; continue
    try {
        const accessToken = await req.cookies['accessToken']
        const verified = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        next()

    //expired token. renew token, set cookie and continue. no need to send user context here.
    //TODO: consider changing this logic. instead of automatically renewing expired token, 
    //deny instead to force user to relogin.
    } catch (error) {

        //renew expired token
        if (error.name === 'TokenExpiredError') {

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

            //add userId to req. allows accessing userId by routes
            res.userId = decoded.userId

            //add access token in httponly cookie
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                maxAge: 1000000
            })

            next();

            // invalid token; deny
        } else {
            res.status(400).send({ status: "error", message: "invalid token" })
        }
    }
}

