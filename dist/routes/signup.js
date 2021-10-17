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
const express_1 = __importDefault(require("express"));
const connectDb_1 = __importDefault(require("../models/connectDb"));
const usersModel_1 = __importDefault(require("../models/usersModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require('dotenv').config();
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const postgresDb_1 = __importDefault(require("../models/postgresDb"));
exports.signupRouter = express_1.default.Router();
//MIDDLEWARES
//
//connect to db
exports.signupRouter.use((req, res, next) => {
    (0, connectDb_1.default)();
    next();
});
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
    //verify email is not already in use
    const data = yield usersModel_1.default.findOne({ email: req.body.email });
    const data2 = yield postgresDb_1.default.query('SELECT * FROM Person WHERE email=$1', ['mail2']);
    console.log(data2.rows[0]);
    console.log(data);
    if (data) {
        res.status(400).send({ status: "error", message: 'user exists' });
        return;
    }
    //generate password hash
    const salt = yield bcrypt_1.default.genSalt(10);
    const passwordHash = yield bcrypt_1.default.hash(req.body.password, salt);
    //generate refresh token
    //const refreshToken = randtoken.generate(20)
    try {
        //create user with refresh token
        const user = yield usersModel_1.default.create(Object.assign(Object.assign({}, req.body), { password: passwordHash }));
        //generate JWT access token
        const accessToken = yield jsonwebtoken_1.default.sign({
            email: user.email,
            userId: user._id
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: 30,
            algorithm: 'HS512'
        });
        //TODO: Genereate id token
        //construct user context
        const userContext = {
            userId: user._id,
            email: req.body.email,
            accessToken,
            //refreshToken
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
