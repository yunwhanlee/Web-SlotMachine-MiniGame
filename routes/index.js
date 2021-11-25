"use strict";
const express = require("express");
const router = express.Router();

//Render
router.get("/", (req,res)=>{
	res.render("index.ejs");
});

module.exports = router;