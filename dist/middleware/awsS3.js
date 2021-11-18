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
exports.deleteS3Object = exports.generateUploadURL = void 0;
// @ts-nocheck
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const crypto_1 = require("crypto");
const s3 = new aws_sdk_1.default.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    signatureVersion: 'v4',
});
//GET SIGNED URL FOR OBJECT PUT
function generateUploadURL() {
    return __awaiter(this, void 0, void 0, function* () {
        const rawBytes = yield (0, crypto_1.randomBytes)(16);
        const imageName = rawBytes.toString('hex');
        const params = {
            Bucket: 'bhanks',
            Key: `${imageName}.jpg`,
            Expires: 60
        };
        try {
            const data = yield s3.getSignedUrlPromise('putObject', params);
            return data;
        }
        catch (error) {
            throw error;
        }
    });
}
exports.generateUploadURL = generateUploadURL;
//DELETE OBJECT FROM S3
function deleteS3Object(objectKey) {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: objectKey
    };
    s3.deleteObject(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            throw err;
        }
        else
            console.log(data);
    });
}
exports.deleteS3Object = deleteS3Object;
