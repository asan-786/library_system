const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const bookRoutes = require("./routes/bookRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/library", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "library-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: "mongodb://localhost:27017/library" }),
}));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Set view engine
app.set("view engine", "ejs");

// Authentication routes (login/signup)
app.use(authRoutes);

// Protect book routes unless logged in
app.use((req, res, next) => {
  if (!req.session.userId && req.path !== "/login" && req.path !== "/signup") {
    return res.redirect("/login");
  }
  next();
});

// Book-related routes
app.use("/", bookRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
