const express = require("express");             // Requring 'express' package
const app = express();

const port = 8080;

app.listen(port, (req, res) =>{     // checking server connection
    console.log(`Server is Listening on Port : ${port}`);
})

app.get("/",(req, res)=>{
    res.send("WELCOME");
})