// @ts-nocheck

import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    email: {type: String, required: true},
    password:{type: String, required: true},
    refreshToken:{type: String, required: false}
})

module.exports = mongoose.models.User || mongoose.model('User',userSchema) 