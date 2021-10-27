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
exports.urlRouter = void 0;
const express_1 = __importDefault(require("express"));
const awsS3_1 = require("../middleware/awsS3");
exports.urlRouter = express_1.default.Router();
exports.urlRouter.get('/signed-url', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = yield (0, awsS3_1.generateUploadURL)();
        res.status(200).send({ status: 'success', data: url });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: error });
    }
}));
