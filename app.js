"use strict";
//モジュール
const express = require("express");
const path = require('path');
const app = express();

//routes
const index = require("./routes/index.js");

//views
app.set("views", "./views");
app.set("view engine", "ejs");


//ミドルウェア 登録
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", index);

module.exports = app;