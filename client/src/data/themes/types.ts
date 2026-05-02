export type ThemePlayer = {
  name: string;
  number: number;
};

export type ThemeTeam = {
  id: string;
  name: string;
  flag: string;
  primary: string;
  secondary: string;
  accent?: string;
  players: ThemePlayer[];
};

export type ThemeGroup = {
  label: string;
  teams: ThemeTeam[];
};

export type EventTheme = {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  emoji: string;
  activeFrom: string; // ISO date
  activeTo: string;   // ISO date
  groups: ThemeGroup[];
};
