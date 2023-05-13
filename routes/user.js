const express = require("express");
const connection = require("../connection");
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { restart } = require("nodemon");
require('dotenv').config();

var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

router.post('/signup', (req, res) => {
    let user = req.body;
    console.log(user);
    query = "select email,password,role,status, from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.lenght <= 0) {
                query = "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')";
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "succefully registered" });
                    }
                    else {
                        return res.status(500).json(err);
                    }
                });
            }
            else {
                return res.status(400).json({ message: "email already exist." });
            }
        } else {
            return res.status(500).json(err);
        }
    });
});

router.post('/login', (req, res) => {
    const user = req.body;
    query = "select email,password,role,status, from user where email=?";
    connection.query(query, [user.email,], (err, results) => {
        if (!err) {
            if (results.lenght <= 0 || results[0].password != user.password) {
                return res.status(401).json({ message: "incorrect Username or password" });
            }
            else if (results[0].status === 'false') {
                return res.status(401).json({ message: "wait for admin approval" });
            }
            else if (results[0].password == user.password) {
                const response = { email: results[0].email, role: results[0].role };
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' });
                res.status(200).json({ token: accessToken });
            }
            else {
                return res.status(401).json({ message: "somthing went wrone.please try again later" });
            }
        }
        else {
            return res.status(500).json(err);
        }
    });
});


// var transporter = nodemailer.createTestAccount({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASSWORD
//     }
// })

let transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

router.post('forgotpassword', (req, res) => {
    const user = req.body;
    query = "select email,password from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.lenght <= 0) {
                ({ message: "Password sent successfully to your email." });
                return res.status(200).json;
            }
            else {
                var mailOptions = {
                    from: process.env.Email,
                    to: results[0].email,
                    subject: 'Password by Cafe Managemnt System',
                    html: '<p><b>Your Log in details for cafe management system</b><br><b>Email :' + results[0].email + '<br><b>Password : </b>' + results[0].password + ' <br> <a href="localhost:8080/user/login">Click here to log in</a></p>'
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log('email sent :' + info.response);
                    }
                });
                return res.status(200).json({ message: 'Password sent successfully to your email' });
            }
        }
        else {
            return res.status(500).json(err);
        }
    });
});


router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    var query = "select id,name,email,contactNumber.status from user where role='user'";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);

        }
        else {
            return res.status(500).json(err);
        }
    });
});

router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let user = req.body;
    var query = "update user set status=? where id=?";
    connection.query(query, [user.status, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "user id does not exist" });
            }
            return res.status(200).json({ message: "user updated successfully" });
        }
        else {
            return res.status(500).json(err);
        }
    });
});

router.get('/checkToken', auth.authenticateToken, (req, res) => {
    return res.status(200).json({ message: "true" });
});

router.post('/changePassword', auth.authenticateToken, (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    var query = "select *from user where email=? and password=?";
    connection.query(query, [email, user.oldPassword], (err, results) => {
        if (!err) {
            if (results.lenght <= 0) {
                return res.status(400).json({ message: "incorrect old password" });
            }
            else if (results[0].password == user.oldPassword) {
                query = "update user set password=? where email=?";
                connection.query(query, [user.newPassword, email], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "password updated successfully." });
                    }
                    else {
                        return res.status(500).json(err);
                    }
                });

            }
            else {
                return res.status(400).json({ message: "somthing went wrong please try agian later" });
            }
        }
        else {
            return res.status(500).json(err);
        }
    });
});

module.exports = router;
