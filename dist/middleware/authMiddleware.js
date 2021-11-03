"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require('dotenv').config();
const jwt_decode_1 = __importDefault(require("jwt-decode"));
//verify user is authenticated before accessing protected routes
//verify and/or renew token
function verifyUserAuth(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //absent token; deny; early exit
        if (typeof (req.cookies['accessToken']) === 'undefined') {
            res.status(400).send({ status: "error", message: 'missing token' });
            return;
        }
        // decode token to and add to request as userContext. ensures all protected routes know the 
        // user making requests
        const decoded = (0, jwt_decode_1.default)(req.cookies['accessToken']);
        req.userContext = decoded;
        //valid token; continue
        try {
            const accessToken = yield req.cookies['accessToken'];
            const verified = yield jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            next();
            //expired token. renew token, set cookie and continue. no need to send user context here.
            //TODO: consider changing this logic. instead of automatically renewing expired token, 
            //deny instead to force user to relogin.
        }
        catch (error) {
            //renew expired token
            if (error.name === 'TokenExpiredError') {
                //generate new token
                const newAccessToken = yield jsonwebtoken_1.default.sign({
                    email: decoded.email,
                    userId: decoded.userId,
                    firstName: decoded.firstName,
                    lastName: decoded.lastName
                }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: 30,
                    algorithm: 'HS512'
                });
                //add userId to req. allows accessing userId by routes
                res.userId = decoded.userId;
                //add access token in httponly cookie
                res.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    maxAge: 1000000
                });
                next();
                // invalid token; deny
            }
            else {
                res.status(400).send({ status: "error", message: "invalid token" });
            }
        }
    });
}
exports.verifyUserAuth = verifyUserAuth;
