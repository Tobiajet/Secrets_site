//jshint esversion:6
require('dotenv').config();  //needs to be right at the top and no spaces between =
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { runInNewContext } = require("vm");
const encrypt = require("mongoose-encryption")

const app = express();

app.use(express.json()) 

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect(`mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@cluster0.azvyb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,{useNewUrlParser: true});

//create special schema because of mongoose encryptio
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//using secret to encrypt


userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema)

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.render("secrets");
        }
    });
});

app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    //after they login then we find the user

    User.findOne({email: username}, function(err, foundUser){
        if (err) {
            console.log(err);
        } else {
            if (foundUser) { //checking that password matches
                if (foundUser.password === password){
                    res.render("secrets")
                }
            }
        }
    })

});

app.listen(3000, () => {
    console.log("server is listening on port 3000")
});