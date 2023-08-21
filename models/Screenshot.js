const { DataTypes } = require('sequelize');
const db = require('../config/database');
const ScreenshotsMovieLink = require('./ScreenshotsMovieLink');
const Movie = require('./Movie');

const Screenshot = db.define('Screenshot', {
    title: {
        type: DataTypes.STRING,
    },
    url: {
        type: DataTypes.STRING,
    },
    created_by_id: { // User ID of the creator (INTEGER)
        type: DataTypes.INTEGER,
    },
    updated_by_id: { // User ID of the last updater (INTEGER)
        type: DataTypes.INTEGER,
    },
}, {
    tableName: 'screenshots',
    underscored: true
});


module.exports = Screenshot;
