require("dotenv").config();
const express = require("express");
const db = require("./database"); // Import database connection

const app = express();
app.use(express.json()); // Middleware to parse JSON requests

//  Add School API (POST /addSchool)
app.post("/addSchool", (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  //  Validate Input Data
  if (!name || !address || latitude == null || longitude == null) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return res.status(400).json({ error: "Latitude and Longitude must be numbers" });
  }

  //  Insert Data into MySQL table schools
  const sql = "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, address, latitude, longitude], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "School added successfully!", schoolId: result.insertId });
  });
});

//  Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
