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
exports.signInRouter = void 0;
const express_1 = __importDefault(require("express"));
const connectDb_1 = __importDefault(require("../models/connectDb"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const usersModel_1 = __importDefault(require("../models/usersModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.signInRouter = express_1.default.Router();
//MIDDLEWARES
//
//connect to db
exports.signInRouter.use((req, res, next) => {
    //console.log('from sign in')
    (0, connectDb_1.default)();
    next();
});
//parse request body as json
exports.signInRouter.use(express_1.default.json());
//parse cookies
//signInRouter.use(cookieParser())
//SIGN IN
exports.signInRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //verify user email exists
        const user = yield usersModel_1.default.findOne({ email: req.body.email });
        if (!user)
            res.status(401).send({ status: "error", message: "user not found" });
        //verify password
        const isPasswordSame = yield bcrypt_1.default.compare(req.body.password, user.password);
        if (isPasswordSame) {
            //generate JWT access token
            const accessToken = yield jsonwebtoken_1.default.sign({
                email: user.email,
                userId: user._id
            }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: 30,
                algorithm: 'HS512'
            });
            //construct user context
            const userContext = {
                userId: user._id,
                email: req.body.email,
                accessToken
            };
            //add access token in httponly cookie
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                maxAge: 1000000
            });
            //send resonponse
            res.status(200).send({ status: "success", data: userContext });
        }
        else
            res.status(401).send({ status: "error", message: "password mismatch" });
    }
    catch (error) {
        res.status(500).send({ status: "error", message: error });
    }
}));
//SIGN OUT
exports.signInRouter.post('/signout', (req, res) => {
    res.clearCookie('accessToken', { path: '/' });
    res.status(200).send({ status: "success", message: "signout success" });
});
