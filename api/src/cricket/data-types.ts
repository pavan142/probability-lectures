export type Delivery = {
  batter: string;
  bowler: string;
  non_striker: string;
  runs: {
    batter: number;
    extras: number;
    total: number;
  };
  wickets?: {
    player_out: string;
    kind: string;
    fielders: string[];
  }[];
};

export type Over = {
  over: number;
  deliveries: Delivery[];
};

export type Innings = {
  team: string;
  overs: Over[];
};

export type Meta = {
  data_version: string;
  created: string;
  revision: number;
};

export type Info = {
  balls_per_over: number;
  city: string;
  dates: string[];
  event: {
    group: string;
    match_number: number;
    name: string;
    stage: string;
  };
  gender: string;
  match_type: string;
  match_type_number: number;
  officials: {
    match_referees: string[];
    reserve_umpires: string[];
    tv_umpires: string[];
    umpires: string[];
  };
  outcome: {
    by: {
      runs: number;
    };
    winner: string;
  };
  overs: number;
  player_of_match: string[];
  players: {
    [team: string]: string[];
  };
  registry: {
    people: {
      [player: string]: string;
    };
  };
  season: string;
  team_type: string;
  teams: string[];
  toss: {
    decision: string;
    winner: string;
  };
  venue: string;
};

export type MatchData = {
  meta: Meta;
  info: Info;
  innings: Innings[];
};
