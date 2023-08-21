// models/FeaturedImage.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FeaturedImage = sequelize.define(
  "FeaturedImage",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    main: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size_300_w: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    size_200_w: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    size_165_w: {
      type: DataTypes.STRING,
      allowNull: true,
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
    tableName: "featured_images",
    underscored: true,
  }
);

module.exports = FeaturedImage;
