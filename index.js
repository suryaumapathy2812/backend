var mysql = require('mysql');
var cors = require('cors');

var config = require('./config.js');

var con = mysql.createConnection(config);

var express = require('express'),
app = express(),
PORT = process.env.PORT || 5000;


app.use(cors());

//app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
app.listen(PORT);


const bodyparser = require("body-parser");
//bodyparser.urencoded(options)
//parses the text as URL encoded data
//and exposes the resulting object


app.use(bodyparser.urlencoded({
    extended:true
}));

app.use(bodyparser.json());


//GET DATA FROM THE DATABASE

//get all data from the SQL.


//============================================TEST===================================================//
  
app.get('/getusers',(req,res)=>{
    var sql = "select * from users";
    con.query(sql, function(err,result){
        if(err) throw err;
        console.log(result);
        res.send(result);
    });
});

app.get('/getrequests',(req,res)=>{
    var sql = "select * from requests";
    con.query(sql, function(err,result){
        if(err) throw err;
        console.log(result);
        res.send(result);
    });
});

//-----------------------------------------login & Register-------------------------------------//

app.post('/login',(req,res)=>{
    var sql = "select * from users where email =? and password=?";
    var params = [req.body.email,req.body.password];
    con.query(sql,params, function(err,data){
        if(err){
            res.json(err);
        }else{
            if(data.length== 1){
                res.json(data[0]);
            }else{
                res.json({"errorMessage":"Invalid Username or Password"})
            }
        }
    });
});


app.post('/adduser',(req,res)=>{
    var sql = "INSERT INTO users(username,email,password,role) VALUES (?,?,?,?)";
    var params = [req.body.username,req.body.email,req.body.password,req.body.role];
    con.query(sql,params, function(err,result){
        if(err) throw err;
        res.send(result);
    });
});


//----------------------------------------Requests--------------------------------------------//

app.get('/adminRequests/:id',(req,res)=>{
    var sql = "select * from requests where created_by_id=?";
    var params = [req.params.id];
    con.query(sql,params, function(err,data){
        if(err) throw err;
        res.send(data);
    });
});




app.get('/userRequests',(req,res)=>{
    var sql = "select * from requests";
    con.query(sql, function(err,data){
        if(err) throw err;
        res.send(data);
    });
});

//======================================Donations===============================================//


app.get('/request/:req_id',(req,res)=>{
    var sql = "select * from requests where request_id=?";
    var params = [req.params.req_id];
    con.query(sql,params, function(err,data){
        if(err) throw err;
        res.send(data);
    });
});     


app.post('/donate',(req,res)=>{
    var sql = "INSERT INTO donations(request_id,donor_id,donation_amount) VALUES (?,?,?)";
    var params = [req.body.reqID,req.body.donorID,req.body.donation];
    con.query(sql,params, function(err,data){
        if(err){
            res.json(err);
        }else{
            res.send("donated Successfully");
        }
    });
});

app.post('/usrDonations',(req,res)=>{
    var sql = "SELECT r.request_id,r.name,d.donation_amount FROM donations d, requests r WHERE r.request_id=d.request_id AND donor_id=?";
    var params = [req.body.ID];
    con.query(sql,params, function(err,data){
        if(err) throw err;
        res.send(data);
    });
});

app.post('/admDonations',(req,res)=>{
    var sql = "SELECT f.request_id,f.name,f.amount,d.donor_id,d.donation_amount FROM requests f,donations d WHERE f.request_id=d.request_id AND f.created_by_id=?";
    var params = [req.body.ID];
    con.query(sql,params, function(err,data){
        if(err) throw err;
        res.send(data);
    });
})