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
const authMiddleware_1 = require("../middleware/authMiddleware");
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
exports.postRouter.get('/posts', authMiddleware_1.isUserAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield postgresDb_1.default.query('SELECT * FROM table1', []);
        console.log(data.rows);
        res.status(200).send({ status: 'success', data: data });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ status: 'error', error: err });
    }
}));
