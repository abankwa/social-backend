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
exports.postRouter = void 0;
const express_1 = __importDefault(require("express"));
const postgresDb_1 = __importDefault(require("../models/postgresDb"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
exports.postRouter = express_1.default.Router();
//enable CORS
exports.postRouter.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
//parse cookies
exports.postRouter.use((0, cookie_parser_1.default)());
//parse request body as json
exports.postRouter.use(express_1.default.json());
//GET ALL POSTS BY USER
//postRouter.get('/posts', isUserAuthenticated, async (req, res) => {
exports.postRouter.get('/user/:userId/posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield postgresDb_1.default.query('SELECT * FROM Post WHERE personid = $1', [req.params.userId]);
        res.status(200).send({ status: 'success', data: data.rows });
    }
    catch (err) {
        res.status(500).send({ status: 'error', error: err });
    }
}));
//GET POST BY ID
exports.postRouter.get('/posts/:postId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const data = yield postgresDb_1.default.query('SELECT * FROM Post WHERE PostId = $1', [postId]);
        res.status(200).send({ data: data.rows });
    }
    catch (err) {
        res.status(500).send({ status: 'error', message: err });
    }
}));
//CREATE POST
//postRouter.post('/post', isUserAuthenticated, async (req, res) => {
exports.postRouter.post('/post', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postText, personId, mediaURL } = req.body;
        const data = yield postgresDb_1.default.query('INSERT INTO Post (postText, personId, mediaUrl) VALUES ($1,$2,$3)', [postText, personId, mediaURL]);
        res.status(201).send({ status: 'success' });
        console.log('success');
    }
    catch (error) {
        res.status(500).send({ status: 'error', error });
        console.log(error);
    }
    //TODO: determine personId before inserting into Post
}));
//DELETE POST BY USER
//postRouter.post('/post', isUserAuthenticated, async (req, res) => {
exports.postRouter.delete('/post', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { personid, postid } = req.body;
        console.log(req.body);
        const data = yield postgresDb_1.default.query('DELETE FROM Post WHERE postid=$1 AND personid=$2', [postid, personid]);
        res.status(200).send({ status: 'success' });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error' });
    }
}));
//GET NEW FEED
//use some algo to determine what posts from user's friend's or subscription to show 
//on their feed
