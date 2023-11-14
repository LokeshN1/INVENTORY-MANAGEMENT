const express = require("express");             // Requring 'express' package
const app = express();

const port = 8080;

// Requireing MySql2 Database -:
const mysql = require('mysql2');        // get the client

// create the connection to database-:
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'Inventory',
  password: "L1oke&hn1sql"
});


let q = "SHOW TABLES";

// Query -:
try {
    connection.query(q, (err, result) =>{
        if(err) throw err;
        console.log(result);
    });
} catch (err) {
    console.log(err);
}

app.listen(port, (req, res) =>{     // checking server connection
    console.log(`Server is Listening on Port : ${port}`);
})

app.get("/",(req, res)=>{
    res.send("WELCOME");
})