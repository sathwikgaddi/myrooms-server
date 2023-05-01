const mongoose = require("mongoose");

var mongoURL = "mongodb+srv://zyxsteir:NRIW2lABNpOojyWi@cluster0.hfspnbw.mongodb.net/myRooms"

// 

mongoose.connect(mongoURL)

var connection = mongoose.connection
connection.on('error', () => {
    console.log("Connection failed")
})

connection.on('connected', ()=> {
    console.log("success");
})

module.exports = mongoose