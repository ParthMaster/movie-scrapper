// models/ScreenshotsMovieLink.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ScreenshotsMovieLink = sequelize.define(
    'ScreenshotsMovieLink',
    {
        screenshot_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        movie_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        screenshot_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: 'screenshots_movie_links',
        underscored: true,
        timestamps: false, // Exclude created_at and updated_at
    }
);

module.exports = ScreenshotsMovieLink;
