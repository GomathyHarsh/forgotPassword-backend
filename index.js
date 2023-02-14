require('dotenv').config();
const express = require('express');
const db=require('./db/connection');
const jwt = require('jsonwebtoken');

const cors=require('cors');
const cookieParser = require('cookie-parser');
const app=express();

//Importing routes
const authRoutes=require('./routes/auth.routes');
const emailRoutes=require('./routes/email.routes');
const userRoutes=require('./routes/user.routes');

//Connecting DB
db();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
   origin: 'http://localhost:3000',
   credentials:true
}
));

app.get('/',(req,res)=>{
    res.send('Welcome To Email Sending Tool');
})  

app.use('/api',authRoutes);
app.use('/api',emailRoutes);
app.use('/api',userRoutes);

const PORT = process.env.PORT || 5000;  

app.listen(PORT, () => {
    console.log(`App is running on PORT ${PORT}`);
})