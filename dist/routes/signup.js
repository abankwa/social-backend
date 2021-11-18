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
exports.signupRouter = void 0;
// @ts-nocheck
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require('dotenv').config();
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const postgresDb_1 = __importDefault(require("../models/postgresDb"));
exports.signupRouter = express_1.default.Router();
//MIDDLEWARES
//
// //connect to db      MONGODB
// signupRouter.use((req, res, next) => {
//     connectDb()
//     next()
// })
//parse request body as json
exports.signupRouter.use(express_1.default.json());
//enable CORS
exports.signupRouter.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
//parse cookies
exports.signupRouter.use((0, cookie_parser_1.default)());
exports.signupRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //TODO: validate input data eg. email format, password length, etc
    const { email, password, firstName, lastName } = req.body;
    //verify email is not already in use
    //const data = await User.findOne({ email: req.body.email })// MONGO
    const data = yield postgresDb_1.default.query('SELECT * FROM Person WHERE email=$1', [email]);
    //if (data) { //MONGO
    if (data.rows[0]) {
        res.status(400).send({ status: "error", message: 'user exists' });
        return;
    }
    //generate password hash
    let passwordHash;
    try {
        const salt = yield bcrypt_1.default.genSalt(10);
        passwordHash = yield bcrypt_1.default.hash(password, salt);
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: error });
    }
    try {
        //create user 
        // const user = await User.create({     // MONGODB
        //     ...req.body,
        //     password: passwordHash,
        // })
        yield postgresDb_1.default.query('INSERT INTO Person (email,userpassword,firstname,lastname) VALUES ($1,$2,$3,$4)', [email, passwordHash, firstName, lastName]);
        const user = yield postgresDb_1.default.query('SELECT * FROM Person WHERE email=$1', [req.body.email]);
        //generate JWT access token
        const accessToken = yield jsonwebtoken_1.default.sign({
            userId: user.rows[0].userid,
            email: user.rows[0].email,
            firstName: user.rows[0].firstname,
            lastName: user.rows[0].lastname,
            //userId: user._id  // MONGO
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: 30,
            algorithm: 'HS512'
        });
        //TODO: Genereate id token
        //construct user context
        const userContext = {
            //userId: user._id,     // MONGODH
            userId: user.rows[0].userid,
            email: user.rows[0].email,
            firstName: user.rows[0].firstname,
            lastName: user.rows[0].lastname,
            accessToken,
        };
        //add access token in httponly cookie
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 10000000
        });
        //send response
        res.status(201).send({ status: "success", data: userContext });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: "error", message: 'write failed' });
    }
}));
