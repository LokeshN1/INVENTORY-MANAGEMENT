const express = require("express");             // Requring 'express' package
const app = express();

// Installing EJS package-:
app.set("view engine", "ejs");
const path = require("path");       // to access 'views' folder
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, 'public')));

// Requiring 'uuid' package to genrate unique id's -:
const {v4: uuidv4} = require('uuid');

// Requiring 'method-override' package-:
const methodOverride = require("method-override");
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended: true}));      // so express can read data came from form

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


// HOME PAGE 
app.get("/home",(req, res)=>{
    res.render("home.ejs");
})


// SHOW INVENTORY DATA-: 
app.get("/home/show", (req, res) =>{
    let q = `SELECT * FROM list`;
    try {
        connection.query(q, (err, list_data) =>{
            console.log(list_data);
            res.render("show.ejs", {list_data});
        })
    } catch (err) {
        console.log(err);
        res.send("Database facing Error. Try Again...");
    }
})


// Update Page-: here 'edit' and 'delete' button will be provided along with inventory data
app.get("/home/update", (req, res) =>{
    let q = `SELECT * FROM list`;
    try {
        connection.query(q, (err, list_data) =>{
            console.log(list_data);

            res.render("update.ejs", {list_data});      // redering to update page
        })
    } catch (err) {
        console.log(err);
        res.send("Database facing Error. Try Again...");
    }
})


// Edit Page-: here we will take new value from the user which user want to insert
app.get("/update/:id/edit", (req, res)=>{
    let {id : cur_id} = req.params;
    console.log(cur_id);
    let q = `SELECT * FROM list WHERE id = '${cur_id}'`;
    try {
        connection.query(q, (err, result)=>{
            if(err) throw err;
            console.log(result);
            let edit_product = result[0];
            console.log(edit_product);
            res.render("edit.ejs", {edit_product});     // rendering to edit page

        })
    } catch (err) {
        console.log(err);
        res.send("Database facing Error. Try Again...");
    }
})


// Updating inventory-: after taking updated data from edit page patch request will sent.
app.patch("/edit/:id", (req, res) =>{
    console.log(req.params);
    let {id : id} = req.params;

    console.log(req.body);      // updated data is stored on req.body

    let {unit : new_unit, ppu : new_ppu} = req.body;
    let new_stock_value = new_unit*new_ppu;

    // updating data of database-:
    q = `UPDATE list SET
        unit = ${new_unit},
        ppu = ${new_ppu},
        stock_value = ${new_stock_value}
        WHERE id = '${id}'`;

    try {
        connection.query(q, (err, result) => {
            res.redirect("http://localhost:8080/home/show");    // after updating data redirecting to show page{where all inventory data will shown}
        })
    } catch (err) {
        console.log(err);
        res.send("Updation Unsuccessful");
    }

})


// DELETE PAGE-: on clicking delete button request will sent here
app.get("/update/:id/delete", (req, res) => {
    let {id} = req.params;
    let q = `SELECT * FROM list WHERE id = '${id}'`;
    try {
        connection.query(q, (err, result) => {
            console.log(result);
            let del = result[0];
            console.log(res);
            res.render("delete.ejs", {del});
        })
    } catch (err) {
        console.log(err);
    }
})


// Confirming deletion-: on clicking 'Confirm' button in delete page request will sent here
app.delete("/delete/:code&:id", (req, res)=>{
    let {id: id, code = code} = req.params;
    let {txt_pcode} = req.body;

    // console.log(id);
    // console.log(code);


    let q = `SELECT * FROM list 
             WHERE id = '${id}'`;
    try {
        connection.query(q, (err, result) => {
            if(err) throw err;

            // if deletion Unsuccessful (means user wrote wrong pcode )
            if(txt_pcode != code){
                res.render("failedDelete.ejs", {code});     //render to failedDelete.ejs template
            }

            // if stock deleted successfully (means user wrote right pcode )
            else{

                // delete that stock from database
                let q2 = `DELETE FROM list      
                WHERE id = '${id}'`;
                try {
                    connection.query(q2, (err, result) => {
                        if(err) throw err;
                        console.log(result);
                        res.redirect("/home/show");    // after deleting stock redirecting to show page{where all inventory data will shown}
                })
                } catch (err) {
                    console.log(err);
                    res.send("Database facing Error. Try Again...");
                }
            }
            
        })
    } catch (err) {
        console.log(err);
        res.send("Database facing Error. Try Again...");
    }

})



// ADD NEW STOCK-: if user click on 'add new stock' button so request will sent here and page will render to newstockform template
app.get("/home/newstock", (req, res) => {
    res.render("newstockform.ejs");
})


// Preview-: after filling details of new stock when user click on 'add' button in newstockform template request will sent here and page will render to newstockpreview template
app.post("/newstockpreview", (req, res) =>{
    let new_det = req.body;
    res.render("newstockpreview.ejs", {new_det})
})


//Import the body-parser middleware. -> so i can sent object with request from client side in the form of string using JSON.stringify()
app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// ADD NEW STOCK IN DB-: in newstockpreview template if user click on 'confirm' button request will sent here. 
// details of newstock were stored in new_det object we sent that object in form of string along with request
app.post("/addstock", (req, res) => {
    let new_stk = JSON.parse(req.body.new_det);     // extract that object's details
    console.log(new_stk);
    let stock_value = new_stk.unit*new_stk.ppu;

    // storing object's key's value in array 'arr'-:
    let arr = [uuidv4(), new_stk.pcode, new_stk.pname, new_stk.unit, new_stk.ppu, stock_value];
    console.log(arr);
    
    // Adding new stock in Database-:
    try {
        // inserting new stock in database-:
        let q = `INSERT INTO list                       
        (id, pcode, pname, unit, ppu, stock_value)
        VALUES (?, ?, ?, ?, ?, ?)`;

        connection.query(q, arr, (err, result) => {
            if(err) throw err;
            console.log(result);
            res.redirect("/home/show");     // after storing new stock redirecting to show page.
        })
    } catch (err) {
        console.log(err);
        res.send("Database facing Error. Try Again...");

    }
})

// Sell Stock-: In sidebar if user clicks on 'Sell Stock' request will sent here 
app.get("/home/sellstock", (req, res) => {
    let q = "SELECT * FROM list";
    try {
        connection.query(q, (err, list_data) => {
            console.log(list_data);
            res.render("sell_stock_page.ejs", {list_data}); // response will sent to this template where 'SELL' button is provided in front of each stock
        })
    } catch (err) {
        console.log(err);
        res.send("DATABASE Facing Error");
    }
})

// Sell Stock interface -> when user will click on 'Sell' button request will sent here.
app.get("/sell_page/:id/sell", (req, res) => {
    let {id} = req.params;
    console.log(id);
    let q = `SELECT * FROM list
             WHERE id = '${id}'`;

    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            console.log(result);
            let sell_stock = result[0];
            res.render("sell.ejs", {sell_stock});   // response will sent to this template where user can enter no. of units he want to sell.
        })
    } catch (err) {
        console.log(err);
        res.send("Unable to Proceed. DATABASE Facing Problems");
    }
})

// after selecting no. of units, on clicking 'Confirm' button request will sent here.
app.post("/sell_history/:id", (req, res) => {
    let {id} = req.params;          // id of that stock which you want to sell
    console.log("SELL PAGE");
    console.log(req.body);
    let {sell_unit}= req.body;      // no. of units you want to sell

    sell_unit = parseInt(sell_unit);    // converting sell_unit from string to integer
    console.log(sell_unit);

// Obtaining data of that stock which's unit we want to sell-:
    q = `SELECT * FROM list     
         WHERE id = '${id}'`;
    try {
        connection.query(q, (err, stock) =>{
            if(err) throw err;


            let {unit: stk_unit,  ppu : stk_ppu} = stock[0];    // extracting no. of units and ppu from stock
            
            console.log(stk_unit);      // no. of units
            console.log(stk_ppu);       // price per unit

            let new_unit = stk_unit - sell_unit;      // after selling no. of units avilable 
            let new_stk_val = new_unit * stk_ppu;       // new stock value


    // NOW Updating the stock's data after selling-:
            q1 = `UPDATE list 
            SET unit = '${new_unit}', stock_value = '${new_stk_val}'
            WHERE id = '${id}'`
            try {
                connection.query(q1, (err, result) => {
                    if(err) throw err;
                    console.log(result);
                    res.redirect("/home/show");     // redirecting to visit inventory page
                })
            } catch (err) {
                console.log(err);
                res.send("Unable to sell Stock. DATABASE FACING PROBLEMS...");
            }

        })
    } catch (err) {
        console.log(err);
        res.send("Unable to sell Stock. DATABASE FACING PROBLEMS...")
    }
})