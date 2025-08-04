export type PlayerStats = {
  runs: number[];
  centuries: number;
  wickets: number[];
  fifers: number;
  maidens: number;
  average: number | null;
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
