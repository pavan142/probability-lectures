export type BatsmanScorecard = {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strike_rate: number;
};

export type BowlerScorecard = {
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
};

export type InningsScoreCard = {
  team: string;
  batsmen: BatsmanScorecard[];
  bowlers: BowlerScorecard[];
  total_runs: number;
  total_wickets: number;
  total_overs: number;
  total_balls: number;
  total_extras: number;
};

export const ScoreCardVersion = 1;

export type MatchScorecard = {
  version: number;
  winner: string;
  toss_winner: string;
  toss_decision: string;
  city: string;
  match_type: string;
  match_result: string;
  innings: InningsScoreCard[];
};
