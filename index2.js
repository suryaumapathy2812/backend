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

app.listen(PORT, () => console.log(`Listening on index2.js and PORT is ${PORT}`));

const bodyparser = require("body-parser");

app.use(
    bodyparser.urlencoded({
        extended: true
    })
);

app.use(bodyparser.json());

var mail = require("./mail.js")

//==============================================================================================================================================================================

app.get("/getusers", (req, res) => {
    var user_id = req.query.user_id;
    var role = req.query.role;
    var sql = "select user_id,username,email,role,STATUS,created_on from users";
    if (user_id) {
        console.log("if");
        sql = sql + " where user_id=" + user_id;
        console.log(sql);
    } else if (role) {
        sql = sql + " where role=" + role;
        console.log(sql);
    } else {
        console.log("else");
    }
    con.query(sql, function (err, result) {
        if (err) {
            res.json(err);
        } else {
            console.log(result);
            res.json(result);
        }
    });
});

app.get("/getrequests", (req, res) => {
    var request_id = req.query.request_id;
    console.log(request_id);
    var sql = "select r.*,u.username from requests r, users u where u.user_id=r.created_by_id ";
    if (request_id) {
        console.log("if");
        sql = sql + " AND request_id=" + request_id;
        console.log(sql);
    } else {
        console.log("else");
    }
    con.query(sql, function (err, result) {
        if (err) {
            res.json(err);
        } else {
            console.log(result);
            res.send(result);
        }
    });
});


app.post("/login", (req, res) => {
    var sql = "select * from users where email =? and password=?";
    var params = [req.body.email, req.body.password];
    
    var to = req.body.email;
    var subject = "logged In";
    var content = "You are Logged In.";
    try {
        mail.send(to, subject, content);
    } catch (err1) {
        console.log(err1);
    }

    con.query(sql, params, function (err, data) {
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
    var sql = "INSERT INTO users(username,email,password,role,status) VALUES (?,?,?,?,CASE WHEN ROLE='A' THEN '0' ELSE '1' END )";
    var params = [
        req.body.username,
        req.body.email,
        req.body.password,
        req.body.role,
    ];
    var to = req.body.email;
    var subject = "Registered Successfully";
    var content = "You have successfully registered.";
    try {
        mail.send(to, subject, content);
    } catch (err1) {
        console.log(err1);
    }
    con.query(sql, params, function (err, result) {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
});

app.post("/addrequest", (req, res) => {
    var date = req.body.expiry_date;
    console.log("expiry_Date"  + JSON.stringify(params));
    var sql = "insert into requests(name,description,amount,created_by_id,status,expiry_date) values (?,?,?,?,?,?)";
    var params = [
        req.body.name,
        req.body.description,
        req.body.amount,
        req.body.created_by_id,
        req.body.status,
        req.body.expiry_date
    ];
    console.log(params);
    var to = req.body.email;
    var subject = "Request Created";
    var content = "Your request has been successfully created.";
    try {
        mail.send(to, subject, content);
    } catch (err1) {
        console.log(err1);
    }
    con.query(sql, params, function (err, result) {
        if (err) {
            res.json(err);
        } else {
            res.json("Request Created Successfully");
        }
    })
});

//==================================================================REQUESTS==============================================================================================

app.get("/adminRequests/:id", (req, res) => {
    var sql = "select request_id,name,amount,created_on,expiry_date,status, (CASE WHEN expiry_date < CURDATE() THEN 1 ELSE 0 END ) AS expired from requests  where created_by_id=?";
    var params = [req.params.id];
    con.query(sql, params, function (err, data) {
        if (err) {
            res.json(err);
        } else {
            res.json(data);
        }
    });
});

app.get("/userRequests", (req, res) => {
    var sql = "select request_id,name,amount,created_on,expiry_date,status, (CASE WHEN expiry_date < CURDATE() THEN 1 ELSE 0 END ) AS expired from requests where status='OPEN'";
    con.query(sql, function (err, data) {
        if (err) {
            res.json(err);
        } else {
            res.json(data);
        }
    });
});

//==========================================================================DONATIONS===================================================================================================

app.post("/admDonations", (req, res) => {
    var sql =
        "SELECT f.request_id,f.name,f.amount,u.username,d.donation_amount,d.donation_date FROM requests f,donations d,users u WHERE f.request_id=d.request_id AND u.user_id=d.donor_id AND f.created_by_id=?";
    var params = [req.body.ID];
    con.query(sql, params, function (err, data) {
        if (err) {
            res.json(err);
        } else {
            res.json(data);
        }
    });
});

app.post("/usrDonations", (req, res) => {
    var sql =
        "SELECT r.request_id,r.name,d.donation_amount,d.donation_date FROM donations d, requests r WHERE r.request_id=d.request_id AND donor_id=? order by donation_date desc";
    var params = [req.body.ID];
    con.query(sql, params, function (err, data) {
        if (err) {
            res.json(err);
        } else {
            res.json(data);
        }
    });
});

app.get("/request/:req_id", (req, res) => {
    var sql = "select * from requests where request_id=?";
    var params = [req.params.req_id];
    con.query(sql, params, function (err, data) {
        if (err) {
            res.json(err);
        } else {
            res.json(data);
        }
    });
});

app.post("/donate", (req, res) => {
    var sql = "INSERT INTO donations(request_id,donor_id,donation_amount) VALUES (?,?,?)";
    var params = [req.body.reqID, req.body.donorID, req.body.donation];
   
    var to = req.body.email;
    var subject = "Login";
    var content = "just a test mail";
    /*try {
        mail.send(to, subject, content);
    } catch (err1) {
        console.log(err1);
    }*/
    con.query(sql, params, function (err, data) {
        if (err) {
            res.json(err);
        } else {
            res.json("donated Successfully");
        }
    }); 
});

app.get("/receivedDonations", (req, res) => {
    var reqId = req.query.id;
    console.log(reqId);
    var sql = "SELECT r.request_id,r.name,r.amount,SUM(donation_amount)AS Donation  FROM requests r,donations d WHERE r.request_id=d.request_id GROUP BY r.request_id";
    if (reqId) {
        console.log("if");
        sql = "SELECT r.request_id,r.name,r.amount,SUM(donation_amount)AS Donation  FROM requests r,donations d  WHERE  r.request_id=d.request_id AND r.request_id=" + reqId + " GROUP BY r.request_id";
    } else {
        console.log("else");
    }
    con.query(sql, function (err, data) {
        if (err) {
            res.json(err);
        } else {
            res.json(data);
        }
    });
});

//===============================================================STATUS=========================================================================================================

app.post("/updateUserStatus", (req, res) => {
    var sql = "UPDATE users SET STATUS=? WHERE user_id=?";
    var params = [req.body.status, req.body.user_id];
    con.query(sql, params, function (err) {
        if (err) {
            res.json(err);
        } else {
            res.json("Changed Successfully");
        }
    });
});


app.post("/updateRequestStatus", (req, res) => {
    var sql = "UPDATE requests SET STATUS=? WHERE request_id=?";
    var params = [req.body.status, req.body.request_id];
    con.query(sql, params, function (err) {
        if (err) {
            res.json(err);
        } else {
            res.json("Changed Successfully");
        }
    });
});
