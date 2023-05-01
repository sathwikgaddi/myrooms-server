require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const express = require("express")
const router = express.Router();
const Booking = require("../models/booking")
const moment = require("moment")
const {v4: uuidv4} = require("uuid")
const Room = require("../models/room")



router.post("/bookroom", async(req,res) => {
    const {room,
          userid,
          fromDate,
          toDate, 
          totalAmount,
          totalDays,
          token
    } =  req.body
    console.log(userid)


    try {
        
        const customer = await stripe.customers.create({
            email : token.email,
            source : token.id
        })

        const payment = await stripe.charges.create({
            
            amount : totalAmount * 100,
            customer : customer.id,
            currency : 'USD',
            receipt_email : token.email

            },{
                idempotencyKey : uuidv4()
            }
        )

        if(payment) {

                console.log(userid)
                const newBooking = new Booking({
                    room : room.name,
                    roomid:room._id,
                    userid: userid,
                    fromDate: moment(fromDate).format('DD-MM-YYYY'),
                    toDate: moment(toDate).format('DD-MM-YYYY'),
                    totalamount: totalAmount,
                    totaldays: totalDays,
                    transactionId : "1234"
                })
        
            
                const booking = await newBooking.save()


                console.log(room._id)
                const roomtemp = await Room.findOne({_id: room._id})
                console.log(roomtemp)
        
                roomtemp.currentbookings.push({bookingid : booking._id, fromDate : moment(fromDate).format('DD-MM-YYYY'), toDate: moment(toDate).format('DD-MM-YYYY'), userId:userid, status: booking.status})
                console.log("Camehere-000")
                await roomtemp.save()
        
            console.log("Camehere-1")
        
            
        }
        console.log("Camehere-2")
        res.send("Payment Successful, Your room is booked")
        console.log("Camehere-3")

    } catch (error) {
        console.log("Camehere-4")
       return res.status(400).json({error});
       
    }



   
});

router.post('/getbookingsbyuserid', async(req, res) => {

    const userid = req.body.userid

    try {
        const bookings = await Booking.find({userid:userid})
        res.send(bookings)
    }
    catch(error) {
        res.send(400).json({error})
    }


})


router.post("/cancelbooking", async (req, res) => {

    const {bookingid, roomid} = req.body

    try {

        const bookingitem = await Booking.findOne({_id: bookingid})
        bookingitem.status = 'cancelled'
        await bookingitem.save()

        const room = await Room.findOne({_id: roomid})

        const bookings = room.currentbookings

        const temp = bookings.filter(booking => booking.bookingid.toString() !== bookingid)

        room.currentbookings = temp

        await room.save()

        res.send('Your booking cancelled successfully')
    }
    catch(error){
        res.send(400).json({error});
    }

})

router.get("/getallbookings", async(req,res) => {

    try {
        const bookings = await Booking.find()
        res.send(bookings)
    } catch (error) {
        res.send(400).json(error)
    }

})

module.exports = router