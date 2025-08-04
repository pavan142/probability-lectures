import { processAllMatches } from "./build-score-card";

export type PlayerProfile = {
  name: string;
  runs: number[];
  centuries: number;
  wickets: number[];
  fifers: number;
  maidens: number;
  average: number;
  total_runs: number;
  total_wickets: number;
};

export const buildPlayerProfile = ({
  player_name,
  match_type,
}: {
  player_name: string;
  match_type: string;
}) => {
  const playerProfile: PlayerProfile = {
    name: player_name,
    runs: [],
    centuries: 0,
    wickets: [],
    fifers: 0,
    maidens: 0,
    average: 0,
    total_runs: 0,
    total_wickets: 0,
  };
  processAllMatches(match_type, (matchData) => {
    matchData.innings.forEach((innings) => {
      innings.batsmen.forEach((batsman) => {
        if (batsman.name === player_name) {
          playerProfile.runs.push(batsman.runs);
          if (batsman.runs >= 100) {
            playerProfile.centuries++;
          }
        }
      });
    });
  });

  playerProfile.total_runs = playerProfile.runs.reduce(
    (acc, curr) => acc + curr,
    0
  );
  playerProfile.total_wickets = playerProfile.wickets.reduce(
    (acc, curr) => acc + curr,
    0
  );
  playerProfile.average = playerProfile.total_runs / playerProfile.runs.length;

  return playerProfile;
};

export const test = () => {
  const playerProfile = buildPlayerProfile({
    player_name: "V Kohli",
    match_type: "t20s_male",
  });
  console.log(playerProfile);
};

if (require.main === module) {
  test();
}
