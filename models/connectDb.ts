import mongoose, { mongo } from 'mongoose'

let isConnected: Boolean = false;



export default async function connectDb(){
    //if (isConnected) {console.log('db already connected');return}

    try {
        const db = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        isConnected = true;
        //console.log('db connected')
    } catch (error) {
        console.log(error)
    }
} 
