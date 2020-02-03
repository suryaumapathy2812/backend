var mysql = require("mysql");
var cors = require("cors");

const config = require('config');
//var config = require("./config.js");

const dbConfig = config.get('dbConfig');
console.log(dbConfig);

var con = mysql.createConnection(dbConfig);

var express = require("express"),
  app = express(),
  PORT = process.env.PORT || 5000;

app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  );
  next();
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
//app.listen(PORT);

const bodyparser = require("body-parser");
//bodyparser.urencoded(options)
//parses the text as URL encoded data
//and exposes the resulting object

app.use(
  bodyparser.urlencoded({
    extended: true
  })
);

app.use(bodyparser.json());

//GET DATA FROM THE DATABASE

//get all data from the SQL.

//============================================TEST===================================================//

app.get("/getusers", (req, res) => {
  var sql = "select * from users";
  con.query(sql, function(err, result) {
    if (err) {
      res.json(err);
    } else {
      console.log(result);
      res.send(result);
    }
  });
});

app.get("/getrequests", (req, res) => {
  var sql = "select * from requests";
  con.query(sql, function(err, result) {
    if (err) {
      res.json(err);
    } else {
      console.log(result);
      res.send(result);
    }
  });
});

//-----------------------------------------login & Register-------------------------------------//

app.post("/login", (req, res) => {
  var sql = "select * from users where email =? and password=?";
  var params = [req.body.email, req.body.password];
  con.query(sql, params, function(err, data) {
    if (err) {
      res.json(err);
    } else {
      if (data.length == 1) {
        res.json(data[0]);
      } else {
        res.json({ errorMessage: "Invalid Username or Password" });
      }
    }
  });
});

app.post("/adduser", (req, res) => {
  var sql = "INSERT INTO users(username,email,password,role) VALUES (?,?,?,?)";
  var params = [
    req.body.username,
    req.body.email,
    req.body.password,
    req.body.role
  ];
  con.query(sql, params, function(err, result) {
    if (err) {
      res.json(err);
    } else {
      res.json(result);
    }
  });
});

app.post("/addrequest", (req, res) => {
  var sql =
    "insert into requests(name,description,amount,created_by_id) values (?,?,?,?)";
  var params = [
    req.body.name,
    req.body.description,
    req.body.amount,
    req.body.created_by_id
  ];
  con.query(sql, params, function(err, result){
      if(err){
          res.json(err);
      }else{
          res.json("Request Created Successfully");
      }
  })
});

//----------------------------------------Requests--------------------------------------------//

app.get("/adminRequests/:id", (req, res) => {
  var sql = "select * from requests where created_by_id=?";
  var params = [req.params.id];
  con.query(sql, params, function(err, data) {
    if (err) {
      res.json(err);
    } else {
      res.json(data);
    }
  });
});

app.get("/userRequests", (req, res) => {
  var sql = "select * from requests";
  con.query(sql, function(err, data) {
    if (err) {
      res.json(err);
    } else {
      res.json(data);
    }
  });
});

//======================================Donations===============================================//

app.get("/request/:req_id", (req, res) => {
  var sql = "select * from requests where request_id=?";
  var params = [req.params.req_id];
  con.query(sql, params, function(err, data) {
    if (err) {
      res.json(err);
    } else {
      res.json(data);
    }
  });
});

app.post("/donate", (req, res) => {
  var sql =
    "INSERT INTO donations(request_id,donor_id,donation_amount) VALUES (?,?,?)";
  var params = [req.body.reqID, req.body.donorID, req.body.donation];
  con.query(sql, params, function(err, data) {
    if (err) {
      res.json(err);
    } else {
      res.json("donated Successfully");
    }
  });
});

app.post("/usrDonations", (req, res) => {
  var sql =
    "SELECT r.request_id,r.name,d.donation_amount FROM donations d, requests r WHERE r.request_id=d.request_id AND donor_id=?";
  var params = [req.body.ID];
  con.query(sql, params, function(err, data) {
    if (err) {
      res.json(err);
    } else {
      res.json(data);
    }
  });
});

app.post("/admDonations", (req, res) => {
  var sql =
    "SELECT f.request_id,f.name,f.amount,d.donor_id,d.donation_amount FROM requests f,donations d WHERE f.request_id=d.request_id AND f.created_by_id=?";
  var params = [req.body.ID];
  con.query(sql, params, function(err, data) {
    if (err) {
      res.json(err);
    } else {
      res.json(data);
    }
  });
});
