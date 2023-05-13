const express = require('express');
const connection = require('../connection');

const router = express.Router();
var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');
const { route } = require('./user');


router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {

    let category = req.body;
    query = "insert into category (name) values(?)";
    connection.query(query,[category.name],(err,results)=>{
        if(!err){
            ret
        }
    })
});