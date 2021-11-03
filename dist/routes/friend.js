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
exports.friendRouter = void 0;
const express_1 = __importDefault(require("express"));
const postgresDb_1 = __importDefault(require("../models/postgresDb"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
exports.friendRouter = express_1.default.Router();
//enable CORS
exports.friendRouter.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
//parse cookies
exports.friendRouter.use((0, cookie_parser_1.default)());
//parse request body as json
exports.friendRouter.use(express_1.default.json());
//GET FRIEND DATA
exports.friendRouter.get('/friend/:friendId', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let isFriend;
    const userid = req.userContext.userId;
    const friendid = req.params.friendId;
    //Verify friendship. 
    try {
        const data = yield postgresDb_1.default.query('SELECT * FROM friend where userid=(LEAST($1,$2))::INT and friendid=(GREATEST($1,$2))::INT', [userid, friendid]);
        data.rows.length > 0 ? isFriend = true : isFriend = false;
        console.log(data.rows);
    }
    catch (error) {
        res.status(500).send({ status: "error", message: error });
    }
    //get friend details
    try {
        const data = yield postgresDb_1.default.query('SELECT email, firstname, lastname, userid from person WHERE userid = $1', [friendid]);
        res.status(200).send({ status: 'success', data: [...data.rows, { isFriend: isFriend }] });
    }
    catch (error) {
        res.status(500).send({ status: 'error', message: error });
    }
}));
//ADD FRIEND
exports.friendRouter.post('/friend/:friendId', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.userContext.userId;
    const friendid = req.params.friendId;
    try {
        const data = yield postgresDb_1.default.query('CALL insert_friend($1,$2)', [userid, friendid]);
        res.status(201).send({ status: 'success', data: data.rows });
    }
    catch (error) {
        res.status(500).send({ status: 'error', message: error });
    }
}));
