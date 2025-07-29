const express = require('express');
const cors = require("cors");
require("dotenv").config();
const connectDB = require('./src/database/db');
const passport = require("passport");
require('./src/utils/passport'); 

const app = express();
connectDB();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173"}));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads")); 

// SESSION-LOGIN
app.use(require("express-session")({
  secret: process.env.SESSION_SECRET || "secretkey",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// ROUTE
require('./src/routes/indexRoute')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Start At http://localhost:${PORT}`));
