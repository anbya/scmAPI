require('dotenv').config()
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const app = express()

const PORT = 5005

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb',extended:false}));

app.get("/", function(req,res){
    res.send(`Hello World dari armyali.com API ${process.env.TEST} on port:${PORT}`);
})
app.listen(PORT, () => {
    console.log(`server running on port:${PORT}`);
});