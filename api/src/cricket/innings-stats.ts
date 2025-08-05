import { processAllMatches } from "./build-score-card";

export type InningsStats = {
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  centuries: number;
  fifers: number;
  highest_score: number;
  lowest_score: number;
  max_wickets: number;
  min_wickets: number;
  total_extras: number;
  total_boundaries: number;
  runs_per_over: number;
};

export type InningsData = {
  all: InningsStats[];
  tests: InningsStats[];
  t20s: InningsStats[];
  odis: InningsStats[];
  ipl: InningsStats[];
};

export const getInningsStats = (): InningsData => {
  const inningsData: InningsData = {
    all: [],
    tests: [],
    t20s: [],
    odis: [],
    ipl: [],
  };

  const matchTypes = ["tests", "t20s", "odis", "ipl"];
  matchTypes.forEach((matchType) => {
    const stats = inningsData[matchType as keyof InningsData];
    processAllMatches(`${matchType}_male`, (matchData) => {
      matchData.innings.forEach((innings) => {
        const inningsStats: InningsStats = {
          runs: innings.total_runs,
          wickets: innings.total_wickets,
          overs: innings.total_overs,
          balls: innings.total_balls,
          centuries: innings.batsmen.filter((batsman) => batsman.runs >= 100)
            .length,
          fifers: innings.bowlers.filter((bowler) => bowler.wickets >= 5)
            .length,
          highest_score: innings.batsmen.reduce(
            (max, batsman) => Math.max(max, batsman.runs),
            0
          ),
          lowest_score: innings.batsmen.reduce(
            (min, batsman) => Math.min(min, batsman.runs),
            Infinity
          ),
          max_wickets: innings.bowlers.reduce(
            (max, bowler) => Math.max(max, bowler.wickets),
            0
          ),
          min_wickets: innings.bowlers.reduce(
            (min, bowler) => Math.min(min, bowler.wickets),
            Infinity
          ),
          total_extras: innings.total_extras,
          total_boundaries: innings.batsmen.reduce(
            (acc, batsman) => acc + batsman.fours + batsman.sixes,
            0
          ),
          runs_per_over: innings.total_runs / innings.total_overs,
        };
        stats.push(inningsStats);
      });
    });
  });

  inningsData.all = inningsData.tests
    .concat(inningsData.t20s)
    .concat(inningsData.odis)
    .concat(inningsData.ipl);

  return inningsData;
};

export const test = () => {
  const inningsData = getInningsStats();
  console.log(inningsData.all.length);
};

if (require.main === module) {
  test();
}
