const dotenv = require('dotenv');
const mysql = require("mysql")

dotenv.config({ path: "./assets/.env" });

const connection = mysql.createConnection({
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD,
    user: process.env.MYSQL_USER,
    host: process.env.MYSQL_HOST
})

module.exports = connection