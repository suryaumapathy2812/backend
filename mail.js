var nodemailer = require('nodemailer');
// Reference:https://support.google.com/accounts/answer/185833
// 1. Enable 2 step verification
// 2. Generate App Password
var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: 'naresh.20191224@gmail.com',
        pass: 'pgtsydsulvlfispp'
    },
    tls: {
        rejectUnauthorized: false
    }
});


let sendMail = function sendMail(to, subject, content){

    
    var mailOptions = {
        from: 'naresh.20191224@gmail.com',
        to: to,
        subject: subject,
        text: content
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


module.exports = { send: sendMail };