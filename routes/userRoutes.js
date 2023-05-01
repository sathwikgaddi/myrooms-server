const express = require("express")
const router = express.Router();
const User = require("../models/user")
const verifiedEmails = require("../models/Verification")
var jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

router.post("/register", async(req, res) => {

        const genSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, genSalt)

         try {
            

            console.log("Came here-0")
            const token = crypto.randomBytes(20).toString('hex');
            const newuser = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                verificationToken: token
             });
             const user = await newuser.save()
            
            console.log("Came here-1")
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD,
                },
            });
            console.log("Came here-2")

            const mailOptions = {
                from: process.env.EMAIL_ADDRESS,
                to: "gaddisathwik@gmail.com",
                subject: 'Email Verification',
                html: `<p>Please click <a href="http://localhost:5000/api/users/verify-email?token=${token}">here</a> to verify your email address.</p>`,
              };
              console.log("Came here-3")

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("Came here-4")
                  console.log(error);
                  
                } else {
                    console.log("Came here-5")
                  console.log(`Email sent: ${info.response}`);
                  res.status(200).send('Verification email sent');
                }
              });
            res.send("User registered succesfully")
         }
         catch(error) {
            res.status(400).send({error});
         }

});

router.post("/login", async(req, res) => {

    const {email, password} = req.body

    try {
    const user = await User.findOne({email : email})
    console.log(user)
    if(!user) {
        res.status(404).send(`User with email ${email} not found.`);
    }

    if(!user.verified) {
        res.status(404).send(`Please verify your email to continue`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {

        res.status(404).send(`Incorrect Password, Please try again`);
    }

            console.log("Came here")
            const token = jwt.sign({ userid: user._id, name: user.name , isAdmin: user.isAdmin}, process.env.JWT_SECRET);            
            res.json({token})
       
    } 


    
    catch(e) {
        return res.status(400).json({e});
    }

});

router.get('/verify-email', async(req, res) => {

    const { token } = req.query;
    
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
        return res.status(404).send('Invalid verification token');
      }
    
      user.verified = true;
      user.verificationToken = null;
      await user.save();
    
      res.send('Email verified successfully!');
    
})

module.exports = router