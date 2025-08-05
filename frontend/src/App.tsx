import { useState, useRef, useEffect } from "react";
import { PlayerProfile, InningsData } from "./types/api";
import { getPlayerProfile, getInningsData } from "./services/api";
import { RunsDistributionChart } from "./components/RunsDistributionChart";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { testPlayerProfiles } from "./testData";
import { players } from "./players";
import { CorrelationChart } from "./components/CorrelationChart";

const MATCH_TYPES: { value: string; label: string }[] = [
  { value: "tests", label: "Tests" },
  { value: "t20s", label: "T20s" },
  { value: "odis", label: "ODIs" },
  { value: "ipl", label: "IPL" },
  { value: "all", label: "All" },
];

const DATA_TYPES: { value: string; label: string }[] = [
  { value: "batsmen", label: "Batsmen" },
  { value: "innings", label: "Innings" },
];

const INNINGS_FILTERS = [
  {
    id: "centuries",
    label: "Centuries",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "fifers",
    label: "Fifers",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
];

function App() {
  const [playerName, setPlayerName] = useState("");
  const [matchType, setMatchType] = useState<string>("odis");
  const [dataType, setDataType] = useState<string>("batsmen");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(
    testPlayerProfiles[0]
  );
  const [inningsData, setInningsData] = useState<InningsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredPlayers, setFilteredPlayers] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [chartType, setChartType] = useState<"distribution" | "correlation">(
    "distribution"
  );

  // Filter players based on input
  useEffect(() => {
    if (playerName.trim()) {
      const filtered = players
        .filter((player) =>
          player.toLowerCase().includes(playerName.toLowerCase())
        )
        .slice(0, 8);
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
    setLoading(true);
    setError(null);
    setShowDropdown(false);

    try {
      if (dataType === "batsmen") {
        if (!playerName.trim()) {
          setError("Please enter a player name");
          return;
        }
        const profile = await getPlayerProfile(playerName);
        setPlayerProfile(profile);
        setInningsData(null);
      } else {
        const innings = await getInningsData();
        setInningsData(innings);
        setPlayerProfile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setPlayerProfile(null);
      setInningsData(null);
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

  const handleDataTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDataType(e.target.value);
    // Clear current data when switching types
    setPlayerProfile(null);
    setInningsData(null);
    setError(null);
    setActiveFilters([]);
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  // Get the appropriate stats based on match type
  const getStatsForMatchType = (profile: PlayerProfile, matchType: string) => {
    return profile.stats[matchType as keyof PlayerProfile["stats"]];
  };

  const getInningsForMatchType = (data: InningsData, matchType: string) => {
    return data[matchType as keyof InningsData];
  };

  const currentStats = playerProfile
    ? getStatsForMatchType(playerProfile, matchType)
    : null;

  const currentInnings = inningsData
    ? getInningsForMatchType(inningsData, matchType)
    : null;

  // Filter innings data based on active filters
  const getFilteredInningsData = () => {
    if (!currentInnings) return [];

    let filtered = currentInnings;

    if (activeFilters.includes("centuries")) {
      filtered = filtered.filter((inning) => inning.centuries > 0);
    }

    if (activeFilters.includes("fifers")) {
      filtered = filtered.filter((inning) => inning.fifers > 0);
    }

    return filtered.map((inning) => inning.runs).filter((run) => run > 0);
  };

  const battingData =
    dataType === "batsmen"
      ? currentStats?.runs.filter((run) => run > 0) || []
      : getFilteredInningsData();

  const displayName =
    dataType === "batsmen" ? playerProfile?.name : "All Innings";

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
            {/* Data type dropdown */}
            <select
              value={dataType}
              onChange={handleDataTypeChange}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cricket-500 focus:border-transparent bg-white"
            >
              {DATA_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Player dropdown - only show for batsmen */}
            {dataType === "batsmen" && (
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
            )}

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
              {loading ? <LoadingSpinner /> : "Analyze"}
            </button>
          </div>
        </div>

        {/* Filter tags - only show for innings */}
        {dataType === "innings" && inningsData && (
          <div className="px-4 pb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Filters:
              </span>
              {INNINGS_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    activeFilters.includes(filter.id)
                      ? filter.color
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chart Content */}
        {((dataType === "batsmen" && playerProfile) ||
          (dataType === "innings" && inningsData)) &&
        battingData.length > 0 ? (
          <div className="flex-1 flex flex-col p-4 pt-0">
            <div className="mb-4">
              <h1 className="text-[40px] font-bold text-gray-900 mb-1 ml-[72px]">
                {displayName} -{" "}
                {MATCH_TYPES.find((t) => t.value === matchType)?.label}
              </h1>
            </div>

            {/* Chart Type Toggle - only show for innings */}
            {dataType === "innings" && (
              <div className="mb-4 ml-[72px]">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    Chart Type:
                  </span>
                  <button
                    onClick={() => setChartType("distribution")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      chartType === "distribution"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Distribution
                  </button>
                  <button
                    onClick={() => setChartType("correlation")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      chartType === "correlation"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Correlation
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 min-h-0">
              {dataType === "batsmen" ? (
                <RunsDistributionChart
                  data={battingData}
                  width={window.innerWidth - 100}
                  height={window.innerHeight - 300}
                />
              ) : chartType === "distribution" ? (
                <RunsDistributionChart
                  data={battingData}
                  width={window.innerWidth - 100}
                  height={window.innerHeight - 300}
                />
              ) : (
                <CorrelationChart
                  data={currentInnings || []}
                  width={window.innerWidth - 100}
                  height={window.innerHeight - 300}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <h3 className="text-xl font-medium mb-2">No Data Available</h3>
              <p className="text-sm">
                {dataType === "batsmen"
                  ? "Search for a player to see their runs distribution analysis"
                  : "Click Search to see innings distribution analysis"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
