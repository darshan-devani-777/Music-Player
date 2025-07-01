const express = require('express');
const connectDB = require('./src/database/db');
const passport = require("passport");
require("dotenv").config();
require('./src/utils/passport'); 
const userRoutes = require('./src/routes/userRoute');
const albumRoute = require("./src/routes/albumRoute");

const app = express();
connectDB();

app.use(express.json());
app.use("/uploads", express.static("uploads")); 

// Session-based login
app.use(require("express-session")({
  secret: process.env.SESSION_SECRET || "secretkey",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// ROUTES
app.use('/api/auth', userRoutes);
app.use("/api/auth", albumRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Start At http://localhost:${PORT}`));
