import { useState, useRef, useEffect } from "react";
import { PlayerProfile } from "./types/api";
import { getPlayerProfile } from "./services/api";
import { RunsDistributionChart } from "./components/RunsDistributionChart";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { testPlayerProfiles } from "./testData";
import { players } from "./players";

const MATCH_TYPES: { value: string; label: string }[] = [
  { value: "tests", label: "Test Matches" },
  { value: "t20s", label: "T20 Matches" },
  { value: "odis", label: "ODI Matches" },
  { value: "ipl", label: "IPL Matches" },
  { value: "all", label: "All Matches" },
];

function App() {
  const [playerName, setPlayerName] = useState("");
  const [matchType, setMatchType] = useState<string>("odis");
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(
    testPlayerProfiles[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredPlayers, setFilteredPlayers] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter players based on input
  useEffect(() => {
    if (playerName.trim()) {
      const filtered = players
        .filter((player) =>
          player.toLowerCase().includes(playerName.toLowerCase())
        )
        .slice(0, 10); // Limit to 10 results
      setFilteredPlayers(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setFilteredPlayers([]);
      setShowDropdown(false);
    }
  }, [playerName]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = async () => {
    if (!playerName.trim()) {
      setError("Please enter a player name");
      return;
    }

    setLoading(true);
    setError(null);
    setShowDropdown(false);

    try {
      const profile = await getPlayerProfile(playerName);
      console.log(profile);
      setPlayerProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPlayerProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = (player: string) => {
    setPlayerName(player);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Get the appropriate stats based on match type
  const getStatsForMatchType = (profile: PlayerProfile, matchType: string) => {
    return profile.stats[matchType as keyof PlayerProfile["stats"]];
  };

  const currentStats = playerProfile
    ? getStatsForMatchType(playerProfile, matchType)
    : null;
  const battingData = currentStats?.runs.filter((run) => run > 0) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <label
                htmlFor="playerName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Player Name
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  id="playerName"
                  type="text"
                  value={playerName}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter player name (e.g., Virat Kohli)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cricket-500 focus:border-transparent"
                />
                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                  >
                    {filteredPlayers.map((player) => (
                      <div
                        key={player}
                        onClick={() => handlePlayerSelect(player)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {player}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                onChange={(e) => setMatchType(e.target.value as string)}
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
