var mail= require("./mail.js")

console.log(mail);
var to = "u.pugal@gmail.com ";
var subject = "test Run";
var content = "just a test mail";
mail.send(to, subject, content);