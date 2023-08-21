const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('strapi-test', 'postgres', 'postgres', {
    host: 'localhost',
    dialect: 'postgres',
    logging: true,
});

module.exports = sequelize;
