import { MatchData } from "./data-types";
import {
  MatchScorecard,
  InningsScoreCard,
  BatsmanScorecard,
  BowlerScorecard,
  ScoreCardVersion,
} from "./processed-types";
import fs from "fs";
import path from "path";

const buildScoreCard = (matchData: MatchData): MatchScorecard => {
  const { info, innings } = matchData;

  // Process each innings
  const processedInnings: InningsScoreCard[] = innings.map((inningsData) => {
    const { team, overs } = inningsData;

    // Calculate batting statistics
    const batsmenStats = new Map<string, BatsmanScorecard>();
    const bowlersStats = new Map<string, BowlerScorecard>();

    let totalRuns = 0;
    let totalExtras = 0;
    let totalBalls = 0;
    let totalWickets = 0;

    // Process each over
    if (overs) {
      overs.forEach((over) => {
        const { over: overNumber, deliveries } = over;

        deliveries.forEach((delivery) => {
          const { batter, bowler, runs } = delivery;

          // Update total runs and extras
          totalRuns += runs.total;
          totalExtras += runs.extras;
          totalBalls++;

          // Update batsman statistics
          if (!batsmenStats.has(batter)) {
            batsmenStats.set(batter, {
              name: batter,
              runs: 0,
              balls: 0,
              fours: 0,
              sixes: 0,
              strike_rate: 0,
            });
          }

          const batsman = batsmenStats.get(batter)!;
          batsman.runs += runs.batter;
          batsman.balls++;

          // Count boundaries
          if (runs.batter === 4) batsman.fours++;
          if (runs.batter === 6) batsman.sixes++;

          // Update bowler statistics
          if (!bowlersStats.has(bowler)) {
            bowlersStats.set(bowler, {
              name: bowler,
              overs: 0,
              maidens: 0,
              runs: 0,
              wickets: 0,
            });
          }

          const bowlerStats = bowlersStats.get(bowler)!;
          bowlerStats.runs += runs.total;

          // Calculate overs (assuming 6 balls per over)
          const completedOvers = Math.floor(totalBalls / 6);
          const remainingBalls = totalBalls % 6;
          bowlerStats.overs = completedOvers + remainingBalls / 10; // Decimal format for overs
        });
      });
    }

    // Calculate strike rates for batsmen
    batsmenStats.forEach((batsman) => {
      batsman.strike_rate =
        batsman.balls > 0 ? (batsman.runs / batsman.balls) * 100 : 0;
    });

    // Calculate maidens for bowlers (simplified - would need more logic for actual maiden calculation)
    bowlersStats.forEach((bowlerStats) => {
      // This is a simplified maiden calculation
      // In reality, you'd need to track if an over had no runs conceded
      bowlerStats.maidens = 0; // Placeholder
    });

    return {
      team,
      batsmen: Array.from(batsmenStats.values()),
      bowlers: Array.from(bowlersStats.values()),
      total_runs: totalRuns,
      total_wickets: totalWickets,
      total_overs: Math.floor(totalBalls / 6) + (totalBalls % 6) / 10,
      total_balls: totalBalls,
      total_extras: totalExtras,
    };
  });

  // Determine match result
  let matchResult = "";
  if (info.outcome?.winner) {
    matchResult = `${info.outcome.winner} won by ${
      info.outcome.by?.runs || 0
    } runs`;
  }

  return {
    version: ScoreCardVersion,
    winner: info.outcome?.winner || "",
    toss_winner: info.toss?.winner || "",
    toss_decision: info.toss?.decision || "",
    city: info.city || "",
    match_type: info.match_type || "",
    match_result: matchResult,
    innings: processedInnings,
  };
};

export const processMatch = (
  match_type: string,
  match_id: string
): MatchScorecard => {
  const startTime = Date.now();
  const processedFilePath = path.join(
    "./datasets/cricket/processed/matches",
    match_type,
    `${match_id}.json`
  );

  // Check if processed data already exists
  if (fs.existsSync(processedFilePath)) {
    console.log(
      `Loading existing processed data for match ${match_id} from ${processedFilePath}`
    );
    const existingData = JSON.parse(fs.readFileSync(processedFilePath, "utf8"));
    return existingData;
  }

  // Process the match data
  console.log(`Processing match ${match_id} from ${match_type}...`);
  const rawMatchData = JSON.parse(
    fs.readFileSync(
      `./datasets/cricket/${match_type}_json/${match_id}.json`,
      "utf8"
    )
  );

  const scoreCard = buildScoreCard(rawMatchData);

  // Ensure the processed directory exists
  const processedDir = path.dirname(processedFilePath);
  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir, { recursive: true });
  }

  // Store the processed data
  fs.writeFileSync(processedFilePath, JSON.stringify(scoreCard, null, 2));
  console.log(`Processed data saved to ${processedFilePath}`);

  const endTime = Date.now();
  console.log(`Time taken: ${endTime - startTime}ms`);

  return scoreCard;
};

export const processAllMatches = (
  match_type: string,
  callback?: (matchData: MatchScorecard) => void
) => {
  const startTime = Date.now();
  const matchIds = fs.readdirSync(`./datasets/cricket/${match_type}_json`);
  matchIds.forEach((matchFileName) => {
    if (matchFileName.endsWith(".json")) {
      const matchId = matchFileName.replace(".json", "");
      const matchData = processMatch(match_type, matchId);
      if (callback) {
        callback(matchData);
      }
    }
  });
  const endTime = Date.now();
  console.log(`Time taken: ${endTime - startTime}ms`);
};

export const test = () => {
  processAllMatches("tests_male");
};

if (require.main === module) {
  test();
}
