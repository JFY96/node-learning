const config = require("../config.json");
const Sequelize = require("sequelize");

// connection pool
const sequelize = new Sequelize(config.db, config.db_username, config.db_password, {
    dialect: "mysql", 
    host: "localhost"
});

module.exports = sequelize;