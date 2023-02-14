const express=require('express');
const {  isAuth } = require('../utils/authentication');

const router=express.Router();
router.get('/email',isAuth, (req,res) =>{
    res.send({message:'Welcome To Email Tool'});
})

module.exports= router;