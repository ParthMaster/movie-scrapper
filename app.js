const express = require("express");
const { Sequelize } = require("sequelize");
const sequelize = require("./config/database");
const Movie = require("./models/Movie");
const Screenshot = require("./models/Screenshot");
const ScreenshotsMovieLink = require("./models/ScreenshotsMovieLink");
const { fetchMovieDetails } = require("./movieScraper");
const FeaturedImagesMovieLink = require("./models/FeaturedImagesMovieLink");
const FeaturedImage = require("./models/FeaturedImage");
const movieRoutes = require('./routes/movieRoutes');
const morgan = require("morgan");

const app = express();

app.use(express.urlencoded({ extended: true }));
// Parse JSON request bodies
app.use(express.json());
// Use morgan middleware for request logging
app.use(morgan("dev"));

Movie.belongsToMany(Screenshot, {
  through: ScreenshotsMovieLink,
  foreignKey: "movie_id",
});

Screenshot.belongsToMany(Movie, {
  through: ScreenshotsMovieLink,
  foreignKey: "screenshot_id",
});

// Set up association between Movie and FeaturedImagesMovieLink
Movie.belongsToMany(FeaturedImage, {
  through: FeaturedImagesMovieLink,
  foreignKey: "movie_id",
});

FeaturedImage.belongsToMany(Movie, {
  through: FeaturedImagesMovieLink,
  foreignKey: "featured_image_id",
});

// POST API to scrape movie details and store in the database
app.use(movieRoutes);

// Test database connection and sync models
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // Sync the models with the database
    await sequelize.sync();
    console.log("Database synchronized.");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
})();

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
