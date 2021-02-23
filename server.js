// require('dotenv').config()
// const express = require("express")
// const cors = require("cors")
// const bodyParser = require("body-parser")
// const app = express()

// const Centralkitchen = require("./routes/centralkitchen")
// const Opname = require("./routes/opname")
// const Oauth = require("./routes/oauth")

// const PORT = process.env.PORT || 3009

// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:false}));

// app.get("/", function(req,res){
//     res.send(`Hello World dari JAYGEEGROUP SCM API`);
// })
// app.use("/centralkitchen", Centralkitchen);
// app.use("/opname", Opname);
// app.use("/oauth", Oauth);

// app.get("/testinsert", function(req,res){
//     res.send(`Hello World dari SCM API JAYGEEGROUP`);
// })

// app.listen(PORT, () => {
//     console.log(`server running on port:${PORT}`);
// });