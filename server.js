require('dotenv').config()
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const app = express()
const cron = require('node-cron');
const moment = require('moment-timezone')
const connection = require("./config/centralkitchen")

const Centralkitchen = require("./routes/centralkitchen")

const PORT = process.env.PORT || 3009

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get("/", function(req,res){
    res.send(`Hello World dari JAYGEEGROUP SCM API`);
})
app.use("/centralkitchen", Centralkitchen);

app.get("/testinsert", function(req,res){
    res.send(`Hello World dari SCM API JAYGEEGROUP`);
})

app.listen(PORT, () => {
    console.log(`server running on port:${PORT}`);
});