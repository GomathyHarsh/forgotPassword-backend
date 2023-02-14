const express=require('express');
const Users= require('../models/users.model');
const Tokens= require('../models/token.model');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const crypto = require('crypto');
const {sendEmail}= require('../utils/sendEmail');
const register= async(req,res) =>{
    try{
        const payload=req.body;
        if(!payload.password){
            return res.status(400).send({message:'Password is required'})
        }
        const hashValue=await bcrypt.hash(payload.password,10);
        payload.hashedPassword=hashValue;
        delete payload.password;
        let newUser = new Users(payload);//Validating payload-to check the model and schema
        newUser.save((err,data) => {
            if(err){
                return res.status(400).send({message:'error while registering the user',error:err})
            }
            res.status(201).send({message:'User has been registered successfully',userID:data._id});
        });
    }catch(error){
        res.status(500).send({message:'Internal Server Err'});
        console.log(error);
    }
}
    const signin= async (req,res) =>{
        try{
            const {email,password}=req.body;
            const existingUser= await Users.findOne({email:email});

            if(existingUser){
               const isValidUser= await bcrypt.compare(password,existingUser.hashedPassword);
               if(isValidUser){
                  const token= await jwt.sign({_id: existingUser._id},process.env.SECRET_KEY);//Encryption
                  res.cookie('accessToken',token,{expire:new Date()+86400000});
                  return res.status(201).send({message:'User Signed in successfully'});
               }
               return res.status(401).send({message:'Email and Password dose not match'});
            }

    
        }catch(error){
                     res.status(500).send({message:'Internal Server Error'});
                     console.log(error);
        }
    }
        const signout=async (req,res) =>{
            try{
                await res.clearCookie('accessToken');
                res.status(200).send({message:'Successfully signed out'})
            }catch(error){
                    res.status(500).send({message:'Internal Server Error'})
                    console.log(error);
            }

}
const forgotPassword = async (req,res) => {
    try{
        const {email}=req.body;
        if(!email){
            return res.status(400).send({message:'Email is required'});
        }
        const user= await Users.findOne({email:email});
        if(!user){
            return res.status(400).send({message:'User does not exist'});
        }
        let token=await Tokens.findOne({userId:user._id})
        if(token){
            await token.deleteOne();
        }
        let newToken = crypto.randomBytes(32).toString('hex');
        const hashedToken= await bcrypt.hash(newToken,10);
        const tokenPayload = new Tokens({userId:user._id,token:hashedToken, createdAt:Date.now()});
        await tokenPayload.save();

        const link= `http://localhost:3000/passwordReset?token=${newToken}&id=${user._id}`;
        await sendEmail(user.email,'Password Reset Link',{name:user.name,link: link});
       
        return res.status.send({message:'Email has been sent successfully'});

    }catch(error){
        res.status(500).send({message:"Internal Server Error"});
    }
}
const resetPassword = async (req,res) =>{
    const {userId,token,password}= req.body;
    let resetToken = await Tokens.findOne({userId: userId});
    if(!resetToken){
        return res.status(401).send({message:'Invalid or expired token'});
    }
    const isValid = await bcrypt.compare(token,resetToken.token);
    if(!isValid){
        return res.status(400).send({message:'Invalid Token'});
    }
    const hashedPassword= await bcrypt.hash(password,10);
     Users.findByIdAndUpdate({_id:userId},{$set:{hashedPassword:hashedPassword}},(err,data) =>{
        if(err){
            return res.status(400).send({message:'Error While resetting password'});
        }

    });
    await resetToken.deleteOne();
    return res.status(200).send({message:'Password has been reset successfully'});


}
module.exports={register,signin,signout,forgotPassword,resetPassword};