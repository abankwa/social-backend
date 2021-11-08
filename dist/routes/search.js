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
exports.searchRouter = void 0;
const express_1 = __importDefault(require("express"));
const postgresDb_1 = __importDefault(require("../models/postgresDb"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
exports.searchRouter = express_1.default.Router();
//enable CORS
exports.searchRouter.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
//parse cookies
exports.searchRouter.use((0, cookie_parser_1.default)());
//parse request body as json
exports.searchRouter.use(express_1.default.json());
//GLOBAL LIVE SEARCH RESULTS; while person types
exports.searchRouter.get('/global-search/:searchKey', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const key = req.params.searchKey.trim();
    try {
        const data = yield postgresDb_1.default.query(`SELECT * FROM Person WHERE firstname LIKE $1 ORDER BY firstname ASC LIMIT 10`, [`%${key}%`]);
        res.send({ status: 'success', data: data.rows });
        //TODO: code search order for live search. 
        //first friends' firstname, then lastname, then other people, then posts etc etc.
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error' });
    }
}));
//FRIEND LIVE SEARCH RESULTS; while person types
exports.searchRouter.get('/friend-search/:searchKey', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const key = req.params.searchKey.trim();
    try {
        const data = yield postgresDb_1.default.query(`SELECT * FROM Person WHERE firstname LIKE $1 ORDER BY firstname ASC LIMIT 10`, [`%${key}%`]);
        res.send({ status: 'success', data: data.rows });
        //TODO: code search order for live search. 
        //first friends' firstname, then lastname.
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error' });
    }
}));
//TODO: ALL SEARCH RESULTS
//ie when they actually hit enter
