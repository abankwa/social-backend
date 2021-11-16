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
exports.tokenRouter = void 0;
// @ts-nocheck
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require('dotenv').config();
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const jwt_decode_1 = __importDefault(require("jwt-decode"));
exports.tokenRouter = express_1.default.Router();
//MIDDLEWARES
//
// //connect to db      //MONGODB
// tokenRouter.use((req, res, next) => {
//     connectDb();
//     next()
// })
//parse request body
exports.tokenRouter.use(express_1.default.json());
//enable CORS
exports.tokenRouter.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
//parse cookies in req
exports.tokenRouter.use((0, cookie_parser_1.default)());
//verify and/or renew token
exports.tokenRouter.get('/token/verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //check cookie presence; early exit
    if (typeof (req.cookies['accessToken']) === 'undefined') {
        res.status(400).send({ status: "error", message: 'missing token' });
        return;
    }
    try {
        const accessToken = yield req.cookies['accessToken'];
        const verified = yield jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        //decode token
        const x = (0, jwt_decode_1.default)(req.cookies['accessToken']);
        //construct user context
        const userContext = {
            userId: x.userId,
            email: x.email,
            firstName: x.firstName,
            lastName: x.lastName,
            accessToken: accessToken
        };
        res.status(200).send({ status: "success", data: userContext });
    }
    catch (error) {
        //renew expired token
        //TODO: consider changing this logic. instead of automatically renewing expired token, 
        //deny instead to force user to relogin.
        if (error.name === 'TokenExpiredError') {
            // decode token
            const decoded = (0, jwt_decode_1.default)(req.cookies['accessToken']);
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
            //construct user context
            const userContext = {
                firstName: decoded.firstName,
                lastName: decoded.lastName,
                userId: decoded.userId,
                email: decoded.email,
                accessToken: newAccessToken
            };
            //add access token in httponly cookie
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                maxAge: 1000000
            });
            res.status(200).send({ status: 'success', data: userContext });
            // invalid token
        }
        else {
            res.status(400).send({ status: "error", message: "invalid token" });
        }
    }
}));
