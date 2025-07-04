const express = require('express');
const cors = require("cors");
require("dotenv").config();
const connectDB = require('./src/database/db');
const passport = require("passport");
require('./src/utils/passport'); 
const userRoutes = require('./src/routes/userRoute');
const albumRoute = require("./src/routes/albumRoute");
const artistRoutes = require("./src/routes/artistRoute");
const playlistRoutes = require("./src/routes/playlistRoute");

const app = express();
connectDB();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
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
app.use("/api/auth", artistRoutes);
app.use("/api/auth", playlistRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Start At http://localhost:${PORT}`));
