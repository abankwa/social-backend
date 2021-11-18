// @ts-nocheck

import mongoose, { mongo } from 'mongoose'

let isConnected: Boolean = false;



export default async function connectDb(){

    try {
        const db = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        isConnected = true;
    } catch (error) {
        console.log(error)
    }
} 
