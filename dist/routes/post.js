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
// @ts-nocheck
const express_1 = __importDefault(require("express"));
const postgresDb_1 = __importDefault(require("../models/postgresDb"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const awsS3_1 = require("../middleware/awsS3");
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
exports.postRouter.get('/user/:userId/posts', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //postRouter.get('/user/:userId/posts', async (req, res) => {
    try {
        const data = yield postgresDb_1.default.query('SELECT * FROM Post WHERE personid = $1 ORDER BY postdate DESC', [req.params.userId]);
        res.status(200).send({ status: 'success', data: data.rows });
    }
    catch (err) {
        res.status(500).send({ status: 'error', error: err });
    }
}));
//GET POST BY ID
exports.postRouter.get('/posts/:postId', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.postRouter.post('/post', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //postRouter.post('/post', async (req, res) => {
    try {
        const { postText, personId, mediaURL } = req.body;
        const data = yield postgresDb_1.default.query('INSERT INTO Post (postText, personId, mediaUrl) VALUES ($1,$2,$3)', [postText, personId, mediaURL]);
        res.status(201).send({ status: 'success' });
    }
    catch (error) {
        res.status(500).send({ status: 'error', error });
        console.log(error);
    }
    //TODO: determine personId before inserting into Post
}));
//DELETE POST BY USER
exports.postRouter.delete('/post', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //postRouter.delete('/post', async (req, res) => {
    try {
        //delete post from database
        const { personid, postid } = req.body;
        const data = yield postgresDb_1.default.query('DELETE FROM Post WHERE postid=$1 AND personid=$2', [postid, personid]);
        //delete image from S3 
        const out = (0, awsS3_1.deleteS3Object)(req.body.mediaurl.split('/')[3]);
        res.status(200).send({ status: 'success' });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', error });
    }
}));
//UPDATE POST BY USER
//GET USER FEED
//use some algo to determine what posts from user's friend's or content subscriptions to show 
//on their feed
