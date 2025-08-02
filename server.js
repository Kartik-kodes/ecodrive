const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let trips = []; // In-memory storage

// POST route to receive trip data
app.post("/submit", (req, res) => {
  const trip = req.body;
  console.log("Trip received:", trip);
  trips.unshift(trip); // add to beginning
  res.status(201).json({ message: "Trip data received.", trip });
});

// ✅ GET /trips route
app.get("/trips", (req, res) => {
  res.json(trips);
});

// Default route
app.get("/", (req, res) => {
  res.send("EcoDrive Backend is Running");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
