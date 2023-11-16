const express = require("express");             // Requring 'express' package
const app = express();

// Installing EJS package-:
app.set("view engine", "ejs");
const path = require("path");       // to access 'views' folder
app.set("views", path.join(__dirname, "/views"));


// Requiring 'uuid' package to genrate unique id's -:
const {v4: uuidv4} = require('uuid');

// Requiring 'method-override' package-:
const methodOverride = require("method-override");
app.use(methodOverride('_method'));

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

app.get("/home",(req, res)=>{
    res.render("home.ejs");
})

app.get("/home/show", (req, res) =>{
    let q = `SELECT * FROM list`;
    try {
        connection.query(q, (err, list_data) =>{
            console.log(list_data);
            // res.
            res.render("show.ejs", {list_data});
        })
    } catch (err) {
        console.log(err);
    }
    // res.send("dfkjs");
})