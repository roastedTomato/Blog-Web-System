const mariadb = require('mariadb');

// Create a database connection pool with configuration
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit:5 // Maximum number of simultaneous database connections
});

module.exports = pool;