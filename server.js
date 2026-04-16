const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://trial3104656_db_user:FyOeF2aoKbyyukjo@movie2.1kf75wy.mongodb.net/?appName=movie2")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

let favorites = [];
const express = require("express");
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
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

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

       // Add a movie to favorites

app.post("/addFavorite", async (req, res) => {
  try {
    const movie = req.body;

    const exists = await Movie.findOne({ imdbID: movie.imdbID });

    if (!exists) {
      await Movie.create(movie);
    }

    res.json({ message: "Added to DB" });

  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving movie");
  }
});
app.get("/favorites", async (req, res) => {
  const movies = await Movie.find();
  res.json(movies);
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



const movieSchema = new mongoose.Schema({
  Title: String,
  Year: String,
  imdbID: String,
  Poster: String
});

const Movie = mongoose.model("Movie", movieSchema);

