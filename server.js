require("dotenv").config();
const express = require("express");
const connection = require("./database");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); 

//the addSchool route
app.post("/addSchool", (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Basic validation
    if (!name || !address || latitude == null || longitude == null) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (typeof latitude !== "number" || typeof longitude !== "number") {
        return res.status(400).json({ error: "Latitude and Longitude must be numbers" });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ error: "Invalid latitude or longitude values" });
    }

    // Insert school (MySQL will enforce unique lat/long)
    const insertQuery = "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
    connection.query(insertQuery, [name, address, latitude, longitude], (err, result) => {
        if (err) {
            if (err.code === 'duplicate entry error hai: ') {
                return res.status(400).json({ error: "A school already exists at this location" });
            }
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "School added successfully", id: result.insertId });
    });
});

app.get("/listSchools", (req, res) => {
    const { latitude, longitude } = req.query;

    // Validate user latitude & longitude
    if (latitude == null || longitude == null) {
        return res.status(400).json({ error: "Enter some values bro" });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ error: "Invalid latitude or longitude values" });
    }

    // Convert lat & long to numbers
    const userLat = parseFloat(latitude);
    const userLong = parseFloat(longitude);

    // Fetch all schools from database
    const fetchSchoolsQuery = "SELECT * FROM schools";
    connection.query(fetchSchoolsQuery, (err, results) => {
        if (err) {
            console.error("Error fetching schools:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // Function to calculate distance between two coordinates (Haversine formula)
        function getDistance(lat1, lon1, lat2, lon2) {
            const toRad = (angle) => (Math.PI / 180) * angle;
            const R = 6400; 
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // km mein hai
        }

        // Add distance property to each school
        const schoolsWithDistance = results.map((school) => ({
            ...school,
            distance: getDistance(userLat, userLong, school.latitude, school.longitude),
        }));

        // Sort schools by distance (ascending)
        schoolsWithDistance.sort((a, b) => a.distance - b.distance);

        // Return the sorted list
        res.json({ schools: schoolsWithDistance });
    });
});



//  Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
