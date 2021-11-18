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
exports.messengerRouter = void 0;
// @ts-nocheck
const express_1 = __importDefault(require("express"));
const postgresDb_1 = __importDefault(require("../models/postgresDb"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
exports.messengerRouter = express_1.default.Router();
//enable CORS
exports.messengerRouter.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
//parse cookies
exports.messengerRouter.use((0, cookie_parser_1.default)());
//parse request body as json
exports.messengerRouter.use(express_1.default.json());
//GET CONVERSATION GIVEN A PARTICIPANT LIST
exports.messengerRouter.post('/conversation-given-members', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.userContext.userId;
    const participants = [...req.body.data, userid];
    const count = participants.length;
    
    try {
        //get the single conversationid that these participant are a part of
        const data1 = yield postgresDb_1.default.query(`select conversationid from conversation_participant where participantid = ANY($1::int[]) group by conversationid having count(conversationid) = $2`, [participants, count]);
    
        //check the number of participants in this conversation
        if (data1.rows.length > 0) {
            const data2 = yield postgresDb_1.default.query('select count(*) from conversation_participant where conversationid = $1', [data1.rows[0].conversationid]);
        
            //confirm that these participants are the only people in the conversation. prevents matching of conversations where participants are only a subset
            if (parseInt(data2.rows[0].count) === count)
                res.send({ status: 'success', data: data1.rows });
            else
                res.send({ status: 'success', data: [] });
        }
        else
            res.send({ status: 'success', data: [] });
    }
    catch (error) {
        res.status(500).send({ status: 'error', error: error });
    }
}));
//GET MESSAGES GIVEN A CONVERSATION ID
exports.messengerRouter.get('/messages/:conversationid', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.userContext.userId;
    try {
        const data = yield postgresDb_1.default.query('select * from chatmessage where conversationid = $1', [req.params.conversationid]);
        res.status(200).send({ status: 'success', data: data.rows });
    }
    catch (error) {
        res.status(500).send({ status: 'error', message: error });
    }
}));
//GET ALL CONVERSATIONS
exports.messengerRouter.get('/conversations', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield postgresDb_1.default.query('select * from conversation', []);
        res.status(200).send({ status: 'success', data: data.rows });
    }
    catch (error) {
        res.status(500).send({ status: 'error', message: error });
    }
}));
//ADD CHAT MESSAGE
exports.messengerRouter.post('/message', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.userContext.userId;
    const { conversationid, messagetext } = req.body;
    //req.io.emit('chat','yolo bitcheees!')
    try {
        const data = yield postgresDb_1.default.query('insert into chatmessage(conversationid, senderid, messagetext) values($1,$2,$3)', [conversationid, userid, messagetext]);
        res.status(201).send({ status: 'success', data: data.rows });
    }
    catch (error) {
        res.status(500).send({ status: 'error', message: error });
    }
}));
//CREATE NEW CONVERSATION WITH MESSAGE
exports.messengerRouter.post('/conversation-with-message', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userid = req.userContext.userId;
    const members = [...req.body.chatMembers, userid];
    const message = req.body.messagetext;
    //TOO: use postgres transactions for below operation
    try {
        //1. create new conversation
        const data1 = yield postgresDb_1.default.query('insert into conversation default values  returning conversationid', []);
        const conversationid = data1.rows[0].conversationid;
        //2. add members to conversation_participant table
        members.map((member) => __awaiter(void 0, void 0, void 0, function* () {
            yield postgresDb_1.default.query('insert into conversation_participant (conversationid,participantid) values($1,$2)', [conversationid, member]);
        }));
        //3. add the message
        yield postgresDb_1.default.query('insert into chatmessage(conversationid, senderid, messagetext) values($1,$2,$3)', [conversationid, userid, message]);
        res.status(201).send({ status: 'success', data: data1.rows });
    }
    catch (error) {
        res.status(400).send({ status: 'error', message: error });
    }
}));
