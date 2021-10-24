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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const postgresDb_1 = __importDefault(require("../models/postgresDb"));
exports.signInRouter = express_1.default.Router();
//MIDDLEWARES
//
// //connect to db
// signInRouter.use((req, res, next) => {
//     connectDb()
//     next()
// })
//parse request body as json
exports.signInRouter.use(express_1.default.json());
//parse cookies
//signInRouter.use(cookieParser())
//SIGN IN
exports.signInRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //verify user email exists
        //const user = await User.findOne({email: req.body.email}) MONGODB
        const user = yield postgresDb_1.default.query('SELECT * FROM Person WHERE email=$1', [req.body.email]);
        if (!user.rows[0])
            res.status(401).send({ status: "error", message: "user not found" });
        //verify password
        const isPasswordSame = yield bcrypt_1.default.compare(req.body.password, user.rows[0].userpassword);
        if (isPasswordSame) {
            //generate JWT access token
            const accessToken = yield jsonwebtoken_1.default.sign({
                //email: user.email, MONGODB
                // userId: user._id MONGODB
                userId: user.rows[0].userid,
                email: user.rows[0].email,
                firstName: user.rows[0].firstname,
                lastName: user.rows[0].lastname,
            }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: 30,
                algorithm: 'HS512'
            });
            //construct user context
            const userContext = {
                //userId: user._id, MONGODB
                userId: user.rows[0].userid,
                email: user.rows[0].email,
                firstName: user.rows[0].firstname,
                lastName: user.rows[0].lastname,
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
