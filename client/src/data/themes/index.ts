import type { EventTheme, ThemeTeam } from "./types";
import { fifa2026 } from "./fifa-2026";

// Registry — add new themes here, nothing else needs changing
export const ALL_THEMES: EventTheme[] = [
  fifa2026,
];

export function getActiveThemes(): EventTheme[] {
  const now = new Date();
  return ALL_THEMES.filter(t => {
    const from = new Date(t.activeFrom);
    const to = new Date(t.activeTo);
    return now >= from && now <= to;
  });
}

export function getThemeById(id: string): EventTheme | undefined {
  return ALL_THEMES.find(t => t.id === id);
}

export function getTeamById(themeId: string, teamId: string): ThemeTeam | undefined {
  const theme = getThemeById(themeId);
  if (!theme) return undefined;
  for (const group of theme.groups) {
    const team = group.teams.find(t => t.id === teamId);
    if (team) return team;
  }
  return undefined;
}

export type { EventTheme, ThemeTeam };
