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
exports.mediaRouter = void 0;
const express_1 = __importDefault(require("express"));
const awsS3_1 = require("../middleware/awsS3");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authMiddleware_1 = require("../middleware/authMiddleware");
exports.mediaRouter = express_1.default.Router();
//enable CORS
exports.mediaRouter.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
//parse cookies
exports.mediaRouter.use((0, cookie_parser_1.default)());
//parse request body as json
exports.mediaRouter.use(express_1.default.json());
//GET SIGNED URL FROM AWS FOR OBJECT PUT
exports.mediaRouter.get('/put-url', authMiddleware_1.verifyUserAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = yield (0, awsS3_1.generateUploadURL)();
        res.status(200).send({ status: 'success', data: url });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: error });
    }
}));
