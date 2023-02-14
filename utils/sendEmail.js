const nodemailer = require('nodemailer');

exports.sendEmail = async (email,subject,payload) =>{
    try{
        var transporter = await nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'gomathy2511@gmail.com',
              pass: process.env.EMAIL_PASSWORD
            }
          });
          
          var mailOptions = {
            from: 'gomathy2511@gmail.com',
            to: email,
            subject: subject,
            text: JSON.stringify(payload)
          };
          await transporter.sendMail(mailOptions,(err,data) =>{
           if(err){
            console.log('error while sending:',err);
            return false;
           }
           return true;
          })
    }catch(error){
      console.log('error:send mail:',error);
       return false;
    }

}

