import { useState } from "react";
import { PlayerProfile, MatchType } from "./types/api";
import { getPlayerProfile } from "./services/api";
import { RunsDistributionChart } from "./components/RunsDistributionChart";
import { PlayerStats } from "./components/PlayerStats";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { testPlayerProfile } from "./testData";

const MATCH_TYPES: { value: MatchType; label: string }[] = [
  { value: "tests_male", label: "Test Matches" },
  { value: "t20s_male", label: "T20 Matches" },
  { value: "odis_male", label: "ODI Matches" },
  { value: "ipl_male", label: "IPL Matches" },
  { value: "all_male", label: "All Matches" },
];

function App() {
  const [playerName, setPlayerName] = useState("");
  const [matchType, setMatchType] = useState<MatchType>("ipl_male");
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(
    testPlayerProfile
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!playerName.trim()) {
      setError("Please enter a player name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profile = await getPlayerProfile(playerName.trim(), matchType);
      setPlayerProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPlayerProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const battingData = playerProfile?.runs.filter((run) => run > 0) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="playerName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Player Name
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter player name (e.g., Virat Kohli)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cricket-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <div className="md:w-48">
              <label
                htmlFor="matchType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Match Type
              </label>
              <select
                id="matchType"
                value={matchType}
                onChange={(e) => setMatchType(e.target.value as MatchType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cricket-500 focus:border-transparent"
              >
                {MATCH_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-cricket-600 text-white rounded-md hover:bg-cricket-700 focus:outline-none focus:ring-2 focus:ring-cricket-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner /> : "Search"}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Results */}
        {playerProfile && (
          <div className="space-y-8">
            {/* Player Stats */}
            {/* <PlayerStats playerProfile={playerProfile} /> */}

            {/* Runs Distribution Chart */}
            {battingData.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Runs Distribution Analysis
                </h3>
                <p className="text-gray-600 mb-4">
                  Probability distribution of runs scored across{" "}
                  {battingData.length} innings
                </p>
                <RunsDistributionChart data={battingData} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
