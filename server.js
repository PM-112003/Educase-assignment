require("dotenv").config();
const express = require("express");
const connection = require("./database");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

//  Add a new school
app.post("/addSchool", (req, res) => {
    let { name, address, latitude, longitude } = req.body;

    // Convert latitude & longitude to numbers
    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    // Basic validation
    if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "All fields (name, address, latitude, longitude) are required" });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ error: "Invalid latitude or longitude values" });
    }

    // Insert school (MySQL will enforce unique lat/long)
    const insertQuery = "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
    connection.query(insertQuery, [name, address, latitude, longitude], (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") { // Correct MySQL duplicate error code
                return res.status(400).json({ error: "A school already exists at this location" });
            }
            console.error(" Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: " School added successfully", id: result.insertId });
    });
});

//  List schools sorted by distance
app.get("/listSchools", (req, res) => {
    let { latitude, longitude } = req.query;

    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);

    // Validate latitude & longitude
    if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: "Latitude and longitude must be valid numbers" });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ error: "Invalid latitude or longitude values" });
    }

    // Fetch all schools
    const fetchSchoolsQuery = "SELECT * FROM schools";
    connection.query(fetchSchoolsQuery, (err, results) => {
        if (err) {
            console.error(" Error fetching schools:", err);
            return res.status(500).json({ error: "Database error" });
        }

        //  Haversine formula to calculate distance
        function getDistance(lat1, lon1, lat2, lon2) {
            const toRad = (angle) => (Math.PI / 180) * angle;
            const R = 6371; // Radius of Earth in km
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // Distance in km
        }

        // Calculate and sort schools by distance
        const schoolsWithDistance = results.map((school) => ({
            ...school,
            distance: getDistance(latitude, longitude, school.latitude, school.longitude),
        })).sort((a, b) => a.distance - b.distance);

        res.json({ schools: schoolsWithDistance });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
});
