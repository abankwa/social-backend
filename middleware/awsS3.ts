// @ts-nocheck
import aws, { S3 } from 'aws-sdk'
import crypto, { randomBytes } from 'crypto'


const s3 = new aws.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    signatureVersion: 'v4',
})

//GET SIGNED URL FOR OBJECT PUT
export async function generateUploadURL() {
    const rawBytes = await randomBytes(16)
    const imageName = rawBytes.toString('hex')
    const params = {
        Bucket: 'bhanks',
        Key: `${imageName}.jpg`,
        Expires: 60
    }
    try {
        const data = await s3.getSignedUrlPromise('putObject', params)
        return data;
    } catch (error) {
        throw error
    }
}


//DELETE OBJECT FROM S3

export function deleteS3Object(objectKey) {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: objectKey
    }

    s3.deleteObject(params, function (err, data) {
        if (err) {console.log(err, err.stack); throw err}
        else console.log(data)
    })

}