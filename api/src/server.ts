import express from "express";
import cors from "cors";
import { getAllPlayerNames, getPlayerProfile } from "./cricket/player-profile";
import { getInningsStats } from "./cricket/innings-stats";

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all routes
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Allow frontend origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON bodies
app.use(express.json());

// API Routes
app.get("/players", (req, res) => {
  try {
    const playerNames = getAllPlayerNames();
    res.json(playerNames);
  } catch (error) {
    console.error("Error getting all player names:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/innings", (req, res) => {
  try {
    const inningsData = getInningsStats();
    res.json(inningsData);
  } catch (error) {
    console.error("Error getting innings stats:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/player/:player_name", (req, res) => {
  try {
    const { player_name } = req.params;

    const playerProfile = getPlayerProfile(player_name);

    res.json(playerProfile);
  } catch (error) {
    console.error("Error building player profile:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Cricket Player Profile API",
    endpoints: {
      "GET /player/:player_name/:match_type":
        "Get player profile for specific match type",
      "GET /health": "Health check",
    },
    valid_match_types: [
      "tests_male",
      "t20s_male",
      "odis_male",
      "ipl_male",
      "all_male",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
