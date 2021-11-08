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
//VERIFY FRIENDSHIP STATUS
exports.friendRouter.get('/verify-friend/:friendId', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let isFriend;
    let friendRequestStatus = 'none'; /* NONE: friend request not sent
                                        SENT: user has sent a friend request
                                        RECEIVED: user has received a friend request */
    const userid = req.userContext.userId;
    const friendid = req.params.friendId;
    //check friend table
    try {
        const data = yield postgresDb_1.default.query('SELECT * FROM friend where userid=(LEAST($1,$2))::INT and friendid=(GREATEST($1,$2))::INT', [userid, friendid]);
        data.rows.length > 0 ? isFriend = true : isFriend = false;
    }
    catch (error) {
        res.status(500).send({ status: "error", message: error });
    }
    //check friendRequest table if user has sent a request to friend
    try {
        const data = yield postgresDb_1.default.query('SELECT * FROM friendrequest WHERE requesterid=$1 AND receiverid=$2', [userid, friendid]);
        if (data.rows.length > 0) {
            friendRequestStatus = 'sent';
            res.status(200).send({ status: 'success', data: { isFriend, friendRequestStatus } });
            return;
        }
    }
    catch (error) {
        res.status(500).send({ status: "error", message: error });
        return;
    }
    //check friendRequest table if friend has sent a request to user
    try {
        const data = yield postgresDb_1.default.query('SELECT * FROM friendrequest WHERE requesterid=$1 AND receiverid=$2', [friendid, userid]);
        if (data.rows.length > 0) {
            friendRequestStatus = 'received';
            res.status(200).send({ status: 'success', data: { isFriend, friendRequestStatus } });
            return;
        }
    }
    catch (error) {
        res.status(500).send({ status: "error", message: error });
        return;
    }
    //no friend request has been sent/received
    res.status(200).send({ status: 'success', data: { isFriend, friendRequestStatus } });
}));
//ACCEPT FRIEND REQUEST. add entry into friend table, delete friendRequest entry
exports.friendRouter.post('/accept-friend/:friendId', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.userContext.userId;
    const friendid = req.params.friendId;
    try {
        //TODO: use sql transaction
        // add entry into friend table
        const data = yield postgresDb_1.default.query('CALL insert_friend($1,$2)', [userid, friendid]);
        // delete friend request entry from friendrequest table
        yield postgresDb_1.default.query('DELETE FROM friendrequest WHERE requesterid=$1 AND receiverid=$2', [friendid, userid]);
        res.status(201).send({ status: 'success', data: data.rows });
    }
    catch (error) {
        res.status(500).send({ status: 'error', message: error });
    }
}));
//REJECT FRIEND REQUEST. delete the request entry from friendrequest table
exports.friendRouter.post('/reject-friend/:friendId', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.userContext.userId;
    const friendid = req.params.friendId;
    try {
        const data = yield postgresDb_1.default.query('DELETE FROM friendrequest WHERE requesterid=$1 AND receiverid=$2', [friendid, userid]);
        res.status(201).send({ status: 'success', data: data.rows });
    }
    catch (error) {
        res.status(500).send({ status: 'error', message: error });
    }
}));
//SEND FRIEND REQUEST. add entry into friendrequest table
exports.friendRouter.post('/request-friend/:friendId', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.userContext.userId;
    const friendid = req.params.friendId;
    try {
        const data = yield postgresDb_1.default.query('INSERT INTO friendrequest(requesterid, receiverid) VALUES($1,$2)', [userid, friendid]);
        res.status(201).send({ status: 'success', data: data.rows });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: error });
    }
}));
//GET FRIEND REQUESTS + Sender details
exports.friendRouter.get('/friend-requests', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.userContext.userId;
    try {
        const data = yield postgresDb_1.default.query('SELECT person.firstname, person.lastname,person.userid FROM friendrequest INNER JOIN person ON friendrequest.requesterid = person.userid WHERE friendrequest.receiverid = $1', [userid]);
        res.status(200).send({ status: 'success', data: data.rows });
    }
    catch (error) {
        res.status(500).send({ status: 'error', message: error });
    }
}));
//GET FRIEND DATA
exports.friendRouter.get('/friend/:friendId', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let isFriend;
    const userid = req.userContext.userId;
    const friendid = req.params.friendId;
    try {
        const data = yield postgresDb_1.default.query('SELECT email, firstname, lastname, userid from person WHERE userid = $1', [friendid]);
        res.status(200).send({ status: 'success', data: data.rows });
    }
    catch (error) {
        res.status(500).send({ status: 'error', message: error });
    }
}));
//GET ALL FRIENDS 
exports.friendRouter.get('/friends', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.userContext.userId;
    try {
        const data = yield postgresDb_1.default.query('SELECT person.email, person.firstname, person.lastname, person.userid FROM friend INNER JOIN person ON friend.friendid = person.userid WHERE friend.userid = $1', [userid]);
        console.log(data.rows);
        res.status(200).send({ status: 'success', data: data.rows });
    }
    catch (error) {
        res.status(500).send({ status: 'error', message: error });
    }
}));
