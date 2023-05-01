const mongoose = require("mongoose")

const verificationSchema = mongoose.Schema({

    verifiedEmail : {
        type: String, required: true
    }
}, {
    timestamps : true,
})

const verificationModel = mongoose.model('verifiedEmails', verificationSchema)

module.exports = verificationModel