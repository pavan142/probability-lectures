import React from "react";
import { PlayerProfile } from "../types/api";

interface PlayerStatsProps {
  playerProfile: PlayerProfile;
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ playerProfile }) => {
  const { runs, centuries, wickets, fifers, maidens, average, total_runs } = playerProfile;

  // Calculate additional statistics from runs array
  const totalMatches = runs.length;
  const highestScore = Math.max(...runs);
  const strikeRate = totalMatches > 0 ? (total_runs / totalMatches).toFixed(2) : "0.00";
  const boundaries = runs.filter(run => run >= 4).length; // Rough estimate of boundaries

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {playerProfile.name}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Batting Stats */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Batting Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {total_runs}
              </div>
              <div className="text-sm text-gray-600">Total Runs</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {average.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Average</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {strikeRate}
              </div>
              <div className="text-sm text-gray-600">Strike Rate</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {highestScore}
              </div>
              <div className="text-sm text-gray-600">Highest Score</div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {totalMatches}
              </div>
              <div className="text-sm text-gray-600">Matches Played</div>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">
                {centuries}
              </div>
              <div className="text-sm text-gray-600">Centuries</div>
            </div>
          </div>
        </div>

        {/* Bowling Stats */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Bowling Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {wickets.length > 0 ? wickets.reduce((a, b) => a + b, 0) : 0}
              </div>
              <div className="text-sm text-gray-600">Total Wickets</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {fifers}
              </div>
              <div className="text-sm text-gray-600">Five Wicket Hauls</div>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">
                {maidens}
              </div>
              <div className="text-sm text-gray-600">Maidens</div>
            </div>
            <div className="bg-cyan-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-cyan-600">
                {wickets.length > 0 ? Math.max(...wickets) : 0}
              </div>
              <div className="text-sm text-gray-600">Best Bowling</div>
            </div>
            <div className="bg-lime-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-lime-600">
                {wickets.length}
              </div>
              <div className="text-sm text-gray-600">Bowling Innings</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {boundaries}
              </div>
              <div className="text-sm text-gray-600">Boundaries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Matches
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Match #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Runs Scored
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wickets Taken
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {runs.slice(0, 10).map((run, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={run > 0 ? "text-green-600" : "text-gray-400"}>
                      {run} runs
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={wickets[index] > 0 ? "text-blue-600" : "text-gray-400"}>
                      {wickets[index] || 0} wickets
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
