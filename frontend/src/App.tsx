import { useState, useRef, useEffect } from "react";
import { PlayerProfile } from "./types/api";
import { getPlayerProfile } from "./services/api";
import { RunsDistributionChart } from "./components/RunsDistributionChart";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { testPlayerProfiles } from "./testData";
import { players } from "./players";

const MATCH_TYPES: { value: string; label: string }[] = [
  { value: "tests", label: "Tests" },
  { value: "t20s", label: "T20s" },
  { value: "odis", label: "ODIs" },
  { value: "ipl", label: "IPL" },
  { value: "all", label: "All" },
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
        .slice(0, 8); // Limit to 8 results for compact dropdown
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

  const handleMatchTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMatchType(e.target.value);
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
    <div className="h-screen bg-gray-50 p-4 overflow-hidden">
      {/* Error Message */}
      {error && (
        <div className="mb-3">
          <div className="bg-red-50 border border-red-200 rounded-md p-2">
            <p className="text-red-800 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Main Chart Container */}
      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
        {/* Controls in top right */}
        <div className="flex justify-end p-4 pb-2">
          <div className="flex items-center space-x-3">
            {/* Player dropdown */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={playerName}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Search player..."
                className="w-48 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cricket-500 focus:border-transparent"
              />
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
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

            {/* Match type dropdown */}
            <select
              value={matchType}
              onChange={handleMatchTypeChange}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cricket-500 focus:border-transparent bg-white"
            >
              {MATCH_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Search button */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-cricket-600 text-white text-sm rounded-md hover:bg-cricket-700 focus:outline-none focus:ring-2 focus:ring-cricket-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner /> : "Search"}
            </button>
          </div>
        </div>

        {/* Chart Content */}
        {playerProfile && battingData.length > 0 ? (
          <div className="flex-1 flex flex-col p-4 pt-0">
            <div className="mb-4">
              <h1 className="text-[40px] font-bold text-gray-900 mb-1 ml-[72px]">
                {playerProfile.name} -{" "}
                {MATCH_TYPES.find((t) => t.value === matchType)?.label}
              </h1>
              {/* <p className="text-gray-600 text-sm">
                Probability distribution of runs scored across{" "}
                {battingData.length} innings
              </p> */}
            </div>
            <div className="flex-1 min-h-0">
              <RunsDistributionChart
                data={battingData}
                width={window.innerWidth - 100}
                height={window.innerHeight - 200}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <h3 className="text-xl font-medium mb-2">No Data Available</h3>
              <p className="text-sm">
                Search for a player to see their runs distribution analysis
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
