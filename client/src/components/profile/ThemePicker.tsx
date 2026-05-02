import { getActiveThemes, getThemeById } from "@/data/themes";
import type { EventTheme, ThemeTeam } from "@/data/themes/types";

type ThemePickerProps = {
  themeId: string | null;
  teamId: string | null;
  onChange: (themeId: string | null, teamId: string | null) => void;
};

export default function ThemePicker({ themeId, teamId, onChange }: ThemePickerProps) {
  const activeThemes = getActiveThemes();
  const selectedTheme: EventTheme | undefined = themeId ? getThemeById(themeId) : undefined;

  const allTeams: ThemeTeam[] = selectedTheme
    ? selectedTheme.groups.flatMap(g => g.teams)
    : [];

  // Deduplicate teams by id (some configs have duplicates across groups)
  const uniqueTeams = allTeams.filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i);

  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "10px", color: "#1e293b" }}>
        🎨 Event Theme
      </div>

      {/* Theme selector */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
        {/* No theme option */}
        <button
          type="button"
          onClick={() => onChange(null, null)}
          style={{
            padding: "8px 14px",
            borderRadius: "20px",
            border: `2px solid ${!themeId ? "#6366f1" : "#e2e8f0"}`,
            background: !themeId ? "#eef2ff" : "white",
            color: !themeId ? "#6366f1" : "#64748b",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          Standard
        </button>

        {activeThemes.map(theme => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onChange(theme.id, null)}
            style={{
              padding: "8px 14px",
              borderRadius: "20px",
              border: `2px solid ${themeId === theme.id ? "#f59e0b" : "#e2e8f0"}`,
              background: themeId === theme.id ? "#fffbeb" : "white",
              color: themeId === theme.id ? "#b45309" : "#64748b",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>{theme.emoji}</span>
            <span>{theme.shortName}</span>
          </button>
        ))}

        {activeThemes.length === 0 && (
          <p style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>
            No active event themes right now. Check back during FIFA 2026!
          </p>
        )}
      </div>

      {/* Team selector */}
      {selectedTheme && (
        <div>
          <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>
            Pick your team
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
            gap: "8px",
            maxHeight: "260px",
            overflowY: "auto",
            paddingRight: "4px",
          }}>
            {uniqueTeams.map(team => {
              const isSelected = teamId === team.id;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => onChange(selectedTheme.id, team.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    padding: "10px 8px",
                    borderRadius: "12px",
                    border: `2px solid ${isSelected ? team.primary : "#e2e8f0"}`,
                    background: isSelected ? team.primary + "18" : "white",
                    cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>{team.flag}</span>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? team.primary : "#475569",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}>
                    {team.name}
                  </span>
                  {isSelected && (
                    <span style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: team.primary, display: "block",
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected team preview */}
          {teamId && (() => {
            const team = uniqueTeams.find(t => t.id === teamId);
            if (!team) return null;
            return (
              <div style={{
                marginTop: "12px",
                padding: "12px",
                borderRadius: "12px",
                background: team.primary + "12",
                border: `1px solid ${team.primary}40`,
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <span style={{ fontSize: "28px" }}>{team.flag}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: team.primary }}>
                    {team.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    {selectedTheme.badge}
                  </div>
                  {team.players.length > 0 && (
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                      {team.players.map(p => `#${p.number} ${p.name}`).join(" · ")}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
