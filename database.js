require("dotenv").config();
const mysql = require("mysql2");

// Create a MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME, 
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error(" Error connecting to MySQL:", err);
    return;
  }
  console.log(" Connected to Remote MySQL Database");

  // Ensure 'schools' table exists
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS schools (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      latitude FLOAT NOT NULL,
      longitude FLOAT NOT NULL,
      UNIQUE (latitude, longitude)
    )
  `;

  connection.query(createTableQuery, (err) => {
    if (err) {
      console.error(" Error creating schools table:", err);
      return;
    }
    console.log(" Schools table ready");
  });
});

module.exports = connection;
