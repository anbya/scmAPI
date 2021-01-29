require('dotenv').config()
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const app = express()
const cron = require('node-cron');
const moment = require('moment-timezone')

const Centralkitchen = require("./routes/centralkitchen")

const PORT = process.env.PORT || 3009

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get("/", function(req,res){
    res.send(`Hello World dari JAYGEEGROUP SCM API`);
})
app.use("/centralkitchen", Centralkitchen);


app.listen(PORT, () => {
    console.log(`server running on port:${PORT}`);
});