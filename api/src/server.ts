import express from "express";
import { buildPlayerProfile } from "./cricket/player-profile";

const app = express();
const PORT = process.env.PORT || 4000;

// API Routes
app.get("/player/:player_name/:match_type", (req, res) => {
  try {
    const { player_name, match_type } = req.params;

    // Validate match_type
    const validMatchTypes = [
      "tests_male",
      "t20s_male",
      "odis_male",
      "ipl_male",
      "all_male",
    ];
    if (!validMatchTypes.includes(match_type)) {
      return res.status(400).json({
        error: "Invalid match type",
        valid_types: validMatchTypes,
      });
    }

    const playerProfile = buildPlayerProfile({
      player_name,
      match_type,
    });

    // Check if player has any data
    if (playerProfile.total_runs === 0 && playerProfile.total_wickets === 0) {
      return res.status(404).json({
        error: "Player not found",
        message: `No data found for player "${player_name}" in ${match_type} matches`,
      });
    }

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
