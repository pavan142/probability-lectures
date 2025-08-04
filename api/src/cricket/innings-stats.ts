import { processAllMatches } from "./build-score-card";

export type InningsStats = {
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  centuries: number;
  fifers: number;
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
