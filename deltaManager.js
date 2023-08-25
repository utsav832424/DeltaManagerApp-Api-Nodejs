require("dotenv").config();
const express = require("express");
app =  module.exports =express(); 
const profitsharing =  require("./api/profitsharing/profitsharing.router");
const userRouter = require ("./api/users/user.router");
const sheetRouter = require ("./api/sheet/sheet.router");
const salaryRouter = require ("./api/salary/salary.router");
const depositeRouter = require ("./api/deposit/deposite.router");
const ledgerRouter = require ("./api/ledger/ledger.router");
const withdrawalRouter = require ("./api/withdrawal/withdrawal.router");
const notesRouter = require ("./api/note/notes.router");
const superadmin_ledger = require("./api/superadmin_ledger/superadmin_ledger.router");
const bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({extended:true}));


app.get("/api",(req, res)=>{
    res.json({
        success:1,
        message:"this is rest apis working"
    });
});

app.use("/api/profitsharing", profitsharing);
app.use("/api/users", userRouter); 
app.use("/api/sheet", sheetRouter);
app.use("/api/salary", salaryRouter);
app.use("/api/deposit", depositeRouter);
app.use("/api/ledger", ledgerRouter);
app.use("/api/withdrawal", withdrawalRouter);
app.use("/api/notes", notesRouter);
app.use("/api/superadmin_ledger",superadmin_ledger);

app.listen(process.env.APP_PORT, ()=>{
    console.log("Server up and running on PORT : ", process.env.APP_PORT); 
}); 

