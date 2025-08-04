export interface PlayerProfile {
  name: string;
  runs: number[];
  centuries: number;
  wickets: number[];
  fifers: number;
  maidens: number;
  average: number;
  total_runs: number;
  total_wickets: number;
}

export type MatchType =
  | "tests_male"
  | "t20s_male"
  | "odis_male"
  | "ipl_male"
  | "all_male";
