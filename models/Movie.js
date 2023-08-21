const { DataTypes } = require("sequelize");
const db = require("../config/database");
const Screenshot = require("./Screenshot");
const ScreenshotsMovieLink = require("./ScreenshotsMovieLink");

const Movie = db.define(
  "Movie",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description_1: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description_2: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    release_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sort_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imdb_rating: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    info_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quality: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    season: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    episode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    released_year: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    episode_size: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    complete_zip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    format: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    synopsis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    starring: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    movie_created_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_season: {
      type: DataTypes.BOOLEAN,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_by_id: {
      // User ID of the creator (INTEGER)
      type: DataTypes.INTEGER,
    },
    updated_by_id: {
      // User ID of the last updater (INTEGER)
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "movies", // Set custom table name
    underscored: true, // Use snake_case for column names
  }
);

module.exports = Movie;
