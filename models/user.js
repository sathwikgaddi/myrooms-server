const mongoose = require("mongoose")

const userSchema = mongoose.Schema({

    name: {type :String, required: true},
    email: {type :String, required: true},
    password: {type :String, required: true},
    isAdmin: {type :String, default: "No"},
    verified: { type: String, default: "No" },
    verificationToken: {type: String}

}, {
    timestamps : true,
})

const userModel = mongoose.model('users', userSchema)

module.exports = userModel