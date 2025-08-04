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
