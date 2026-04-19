require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const movieSchema = new mongoose.Schema({
  Title: String,
  Year: String,
  imdbID: String,
  Poster: String,
  userId: String   // 👈 ADD THIS
});

const Movie = mongoose.model("Movie", movieSchema);

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const User = mongoose.model("User", userSchema);

const express = require("express");
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());  // ✅ ADD THIS LINE

const API_KEY = "b13ed654";

// 🔍 Search movies
app.get("/search", async (req, res) => {
  const query = req.query.q;

  const url = `https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  res.json(data);
});

// 🎬 Movie details
app.get("/movie/:id", async (req, res) => {
  const id = req.params.id;

  const url = `https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  res.json(data);
});



       // Add a movie to favorites

app.post("/addFavorite", async (req, res) => {
  console.log(req.body);

  try {
    const { movie, userId } = req.body;

    if (!movie || !userId) {
      return res.status(400).send("Missing data");
    }

    const exists = await Movie.findOne({ imdbID: movie.imdbID, userId });

    if (exists) {
      return res.json({ message: "Already added to favorites" });
    }

    await Movie.create({ ...movie, userId });

    res.json({ message: "Added to favorites" });

  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving movie");
  }
});
 
// Get user's favorite movies


app.get("/favorites", async (req, res) => {
  try {
   const userId = req.query.userId;
const movies = await Movie.find({ userId });
    res.json(movies);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching favorites");
  }
});

         // Remove a movie from favorites

app.get("/removeFavorite/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await Movie.deleteOne({ imdbID: id });

    res.json({ message: "Removed from DB" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error removing movie");
  }
});






// signup API
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });

  if (exists) {
    return res.json({ message: "User already exists" });
  }

  await User.create({ username, password });

  res.json({ message: "Signup successful" });
});


// login API 

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });

  if (!user) {
    return res.json({ message: "Invalid credentials" });
  }

 res.json({
  message: "Login successful",
  user: {
    _id: user._id,
    username: user.username
  }
});
});

// all routes here

app.listen(5000, () => {
  console.log("Server running on port 5000");
});