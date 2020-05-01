require("dotenv").config();
const nodemailer = require("nodemailer");
const altMailID = "admissions@scotstudy.co.uk";
const mailID = altMailID;

module.exports.sender = function() {
  return mailID;
};
module.exports.altSender = function() {
  return altMailID;
};
module.exports.applicationSubject = function() {
  return "APPLICATION STATUS";
};

module.exports.messageSubject = function(username) {
  return `MESSAGE FROM ${username} OF SCOTSTUDY`;
};
module.exports.sender = function(username) {
  return;
};

module.exports.messageForAppStatus = function(recipient) {
  return `Hi ${recipient}, <br/> You have a new notification regarding your application with Scotstudy. Kindly login for the latest update`;
};

module.exports.messageForAppSubmission = function(recipient, status) {
 const message= `

Dear ${recipient},<br><br>

Thank you for submitting your application.<br><br>

We will assess your application and get back to you shortly.<br><br>

In the meantime, feel free to contact us in case you have further enquiries. <br><br>

Kind regards,<br><br>

<p>Enquiry & Student Support Unit<br>
Scotia World UK <br>
D74, 10 Colinton Road<br>
Edinburgh, Scotland<br>
EH10 5DT<br>
Email: info@scotstudy.co.uk<br>
Whatsapp: (+44) 0758 677 0652</p>`
  return message;
};

module.exports.send = function(recipient, subject, message) {
  let mailOptions = {
    from:`Scot-Study<${mailID}>`,
    sender: "Message from Scotstudy",
    to: recipient,
    subject: subject,
    html: message
  };

  let transporter = nodemailer.createTransport({
    host: `mail.scotstudy.co.uk`,
    port: 465,
    tls: {
      rejectUnauthorized: false
    },
    auth: {
      user: `${mailID}`,
      pass: process.env.password
    }
  });
  transporter.sendMail(mailOptions, (error, info) => {
    
    if (error)
      return  null
    else
      return info
  });
};
