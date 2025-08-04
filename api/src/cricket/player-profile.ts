import { processAllMatches } from "./build-score-card";
import fs from "fs";
import path from "path";

export type PlayerStats = {
  runs: number[];
  centuries: number;
  wickets: number[];
  fifers: number;
  maidens: number;
  average: number;
  total_runs: number;
  total_wickets: number;
};

export type PlayerProfile = {
  name: string;
  gender: string;
  stats: {
    all: PlayerStats;
    tests: PlayerStats;
    t20s: PlayerStats;
    odis: PlayerStats;
    ipl: PlayerStats;
  };
};

export const buildAllStats = (playerProfile: PlayerProfile) => {
  const matchTypes = ["tests", "t20s", "odis", "ipl"];
  const allStats = initStats();
  matchTypes.forEach((matchType) => {
    const stats =
      playerProfile.stats[matchType as keyof PlayerProfile["stats"]];
    allStats.runs.push(...stats.runs);
    allStats.wickets.push(...stats.wickets);
    allStats.centuries += stats.centuries;
    allStats.fifers += stats.fifers;
    allStats.maidens += stats.maidens;
    allStats.total_runs += stats.total_runs;
    allStats.total_wickets += stats.total_wickets;
  });
  allStats.average = allStats.total_runs / allStats.runs.length;
  return allStats;
};

export const initStats = (): PlayerStats => {
  return {
    runs: [],
    centuries: 0,
    wickets: [],
    fifers: 0,
    maidens: 0,
    average: 0,
    total_runs: 0,
    total_wickets: 0,
  };
};

const buildPlayerProfile = ({
  player_name,
  gender,
}: {
  player_name: string;
  gender: string;
}) => {
  const startTime = Date.now();
  const processedFilePath = path.join(
    "./datasets/cricket/processed/players",
    `${player_name}.json`
  );

  // Check if processed data already exists
  if (fs.existsSync(processedFilePath)) {
    console.log(
      `Loading existing processed data for player ${player_name} from ${processedFilePath}`
    );
    const existingData = JSON.parse(fs.readFileSync(processedFilePath, "utf8"));
    return existingData;
  }

  // Process the player data
  console.log(`Processing player ${player_name}...`);

  const playerProfile: PlayerProfile = {
    name: player_name,
    gender: gender,
    stats: {
      all: initStats(),
      tests: initStats(),
      t20s: initStats(),
      odis: initStats(),
      ipl: initStats(),
    },
  };
  const matchTypes = ["tests", "t20s", "odis", "ipl"];
  matchTypes.forEach((matchType) => {
    const stats =
      playerProfile.stats[matchType as keyof PlayerProfile["stats"]];
    processAllMatches(`${matchType}_${gender}`, (matchData) => {
      matchData.innings.forEach((innings) => {
        innings.batsmen.forEach((batsman) => {
          if (batsman.name === player_name) {
            stats.runs.push(batsman.runs);
            if (batsman.runs >= 100) {
              stats.centuries++;
            }
          }
        });
        innings.bowlers.forEach((bowler) => {
          if (bowler.name === player_name) {
            stats.wickets.push(bowler.wickets);
            if (bowler.wickets >= 5) {
              stats.fifers++;
            }
          }
        });
      });
    });

    stats.total_runs = stats.runs.reduce((acc, curr) => acc + curr, 0);
    stats.total_wickets = stats.wickets.reduce((acc, curr) => acc + curr, 0);
    stats.average = stats.total_runs / stats.runs.length;

    console.log(`Processed ${matchType} stats for ${player_name}`, stats);
  });

  playerProfile.stats.all = buildAllStats(playerProfile);

  // Ensure the processed directory exists
  const processedDir = path.dirname(processedFilePath);
  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir, { recursive: true });
  }

  // Store the processed data
  fs.writeFileSync(processedFilePath, JSON.stringify(playerProfile, null, 2));
  console.log(`Processed data saved to ${processedFilePath}`);

  const endTime = Date.now();
  console.log(`Time taken: ${endTime - startTime}ms`);

  return playerProfile;
};

export const getAllPlayerNames = (): string[] => {
  const allPlayersFilePath = path.join(
    "./datasets/cricket/processed",
    "all_players.json"
  );
  if (fs.existsSync(allPlayersFilePath)) {
    return JSON.parse(fs.readFileSync(allPlayersFilePath, "utf8"));
  }
  const playerNames = new Set<string>();
  processAllMatches("all_male", (matchData) => {
    matchData.innings.forEach((innings) => {
      innings.batsmen.forEach((batsman) => {
        playerNames.add(batsman.name);
      });
      innings.bowlers.forEach((bowler) => {
        playerNames.add(bowler.name);
      });
    });
  });

  // Ensure the processed directory exists
  const processedDir = path.dirname(allPlayersFilePath);
  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir, { recursive: true });
  }

  // Save the array of player names
  const playerNamesArray = Array.from(playerNames);
  fs.writeFileSync(
    allPlayersFilePath,
    JSON.stringify(playerNamesArray, null, 2)
  );
  console.log(`All player names saved to ${allPlayersFilePath}`);

  return playerNamesArray;
};

export const getPlayerProfile = (playerName: string): PlayerProfile => {
  const allPlayers = getAllPlayerNames();
  const player = allPlayers.find((player) => player === playerName);
  if (!player) {
    throw new Error(`Player ${playerName} not found`);
  }
  // todo: infer gender from all_players.json
  return buildPlayerProfile({ player_name: playerName, gender: "male" });
};

export const test = () => {
  // getAllPlayerNames();
  const playerProfile = getPlayerProfile("JJ Bumrah");
  console.log(playerProfile);
};

if (require.main === module) {
  test();
}
