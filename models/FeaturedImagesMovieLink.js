// models/FeaturedImagesMovieLink.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FeaturedImagesMovieLink = sequelize.define(
  "FeaturedImagesMovieLink",
  {
    featured_image_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    movie_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    featured_image_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "featured_images_movie_links",
    underscored: true,
    timestamps: false, // Exclude created_at and updated_at
  }
);

module.exports = FeaturedImagesMovieLink;
