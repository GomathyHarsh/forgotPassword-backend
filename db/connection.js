const express = require("express");
const dotenv = require("dotenv");
const mongoose=require('mongoose');

const db= async () =>
{
    try{
        await mongoose.connect(process.env.MONGO_URL,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
        console.log("Connected to database...")
    }catch(error){
        console.log('Error: ',error);
    }
}

module.exports =db;