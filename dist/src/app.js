"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require('dotenv').config();
const connectDb_1 = __importDefault(require("../models/connectDb"));
const signup_1 = require("../routes/signup");
const signin_1 = require("../routes/signin");
const token_1 = require("../routes/token");
const post_1 = require("../routes/post");
const media_1 = require("../routes/media");
//connect to db
(0, connectDb_1.default)();
console.log('from app');
const app = (0, express_1.default)();
const port = process.env.SERVER_PORT || "3000";
app.use('/api', post_1.postRouter);
app.use('/auth', signup_1.signupRouter);
app.use('/auth', signin_1.signInRouter);
app.use('/auth', token_1.tokenRouter);
app.use('/auth', media_1.mediaRouter);
// start server
app.listen(port, () => {
    console.log(`running on port ${port}`);
});
