const mysql = require("mysql2");

// Create a MySQL connection
const connection = mysql.createConnection({
  host: "localhost", 
  user: "root",      
  password: process.env.SQLPASSWORDP1 + "#" + process.env.SQLPASSWORDP2, 
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");

  // Create Database if it doesn't exist
  connection.query("CREATE DATABASE IF NOT EXISTS school_management", (err) => {
    if (err) throw err;
    console.log("Database created or already exists");

    // Use the created database
    connection.query("USE school_management", (err) => {
      if (err) throw err;

      // Create schools table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS schools (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address VARCHAR(255) NOT NULL,
          latitude FLOAT NOT NULL,
          longitude FLOAT NOT NULL
        )
      `;

      connection.query(createTableQuery, (err) => {
        if (err) throw err;
        console.log("Schools table created or already exists");
        connection.end(); 
      });
    });
  });
});
