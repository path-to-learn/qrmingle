import type { EventTheme } from "./types";

export const fifa2026: EventTheme = {
  id: "fifa-2026",
  name: "FIFA World Cup 2026",
  shortName: "FIFA 2026",
  badge: "⚽ FIFA Fan · 2026",
  emoji: "🏆",
  activeFrom: "2026-06-01",
  activeTo: "2026-07-20",
  groups: [
    {
      label: "Group A",
      teams: [
        { id: "usa", name: "USA", flag: "🇺🇸", primary: "#B22234", secondary: "#FFFFFF", accent: "#3C3B6E", players: [{ name: "Pulisic", number: 10 }, { name: "Turner", number: 1 }] },
        { id: "pan", name: "Panama", flag: "🇵🇦", primary: "#DA121A", secondary: "#FFFFFF", accent: "#005293", players: [{ name: "Davis", number: 10 }] },
        { id: "mex", name: "Mexico", flag: "🇲🇽", primary: "#006847", secondary: "#FFFFFF", accent: "#CE1126", players: [{ name: "Lozano", number: 22 }, { name: "Jiménez", number: 9 }] },
        { id: "uru", name: "Uruguay", flag: "🇺🇾", primary: "#5EB6E4", secondary: "#FFFFFF", accent: "#000000", players: [{ name: "Valverde", number: 8 }, { name: "Núñez", number: 19 }] },
      ],
    },
    {
      label: "Group B",
      teams: [
        { id: "arg", name: "Argentina", flag: "🇦🇷", primary: "#74ACDF", secondary: "#FFFFFF", accent: "#74ACDF", players: [{ name: "Messi", number: 10 }, { name: "Di María", number: 11 }, { name: "Álvarez", number: 9 }] },
        { id: "chi", name: "Chile", flag: "🇨🇱", primary: "#D52B1E", secondary: "#FFFFFF", accent: "#003DA5", players: [{ name: "Vidal", number: 8 }] },
        { id: "per", name: "Peru", flag: "🇵🇪", primary: "#D91023", secondary: "#FFFFFF", accent: "#FFFFFF", players: [{ name: "Guerrero", number: 9 }] },
        { id: "aus", name: "Australia", flag: "🇦🇺", primary: "#00843D", secondary: "#FFD700", accent: "#FFD700", players: [{ name: "Hrustic", number: 8 }] },
      ],
    },
    {
      label: "Group C",
      teams: [
        { id: "esp", name: "Spain", flag: "🇪🇸", primary: "#AA151B", secondary: "#F1BF00", accent: "#F1BF00", players: [{ name: "Yamal", number: 19 }, { name: "Morata", number: 7 }, { name: "Pedri", number: 26 }] },
        { id: "bra", name: "Brazil", flag: "🇧🇷", primary: "#009C3B", secondary: "#FFDF00", accent: "#FFDF00", players: [{ name: "Vinícius Jr", number: 7 }, { name: "Rodrygo", number: 9 }, { name: "Endrick", number: 16 }] },
        { id: "cro", name: "Croatia", flag: "🇭🇷", primary: "#FF0000", secondary: "#FFFFFF", accent: "#0093DD", players: [{ name: "Modrić", number: 10 }, { name: "Gvardiol", number: 24 }] },
        { id: "mar", name: "Morocco", flag: "🇲🇦", primary: "#C1272D", secondary: "#006233", accent: "#FFFFFF", players: [{ name: "Hakimi", number: 2 }, { name: "En-Nesyri", number: 19 }] },
      ],
    },
    {
      label: "Group D",
      teams: [
        { id: "fra", name: "France", flag: "🇫🇷", primary: "#003189", secondary: "#FFFFFF", accent: "#ED2939", players: [{ name: "Mbappé", number: 10 }, { name: "Griezmann", number: 7 }, { name: "Camavinga", number: 14 }] },
        { id: "eng", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", primary: "#FFFFFF", secondary: "#CF081F", accent: "#CF081F", players: [{ name: "Bellingham", number: 10 }, { name: "Saka", number: 7 }, { name: "Kane", number: 9 }] },
        { id: "ned", name: "Netherlands", flag: "🇳🇱", primary: "#FF6600", secondary: "#FFFFFF", accent: "#003DA5", players: [{ name: "Van Dijk", number: 4 }, { name: "Dumfries", number: 2 }] },
        { id: "sen", name: "Senegal", flag: "🇸🇳", primary: "#00853F", secondary: "#FDEF42", accent: "#E31B23", players: [{ name: "Mané", number: 10 }, { name: "Diallo", number: 9 }] },
      ],
    },
    {
      label: "Group E",
      teams: [
        { id: "ger", name: "Germany", flag: "🇩🇪", primary: "#000000", secondary: "#FFFFFF", accent: "#DD0000", players: [{ name: "Musiala", number: 10 }, { name: "Wirtz", number: 17 }, { name: "Havertz", number: 7 }] },
        { id: "por", name: "Portugal", flag: "🇵🇹", primary: "#006600", secondary: "#FFFFFF", accent: "#FF0000", players: [{ name: "Ronaldo", number: 7 }, { name: "B. Silva", number: 10 }, { name: "Leão", number: 11 }] },
        { id: "col", name: "Colombia", flag: "🇨🇴", primary: "#FCD116", secondary: "#003087", accent: "#CE1126", players: [{ name: "James", number: 10 }, { name: "Díaz", number: 7 }] },
        { id: "nga", name: "Nigeria", flag: "🇳🇬", primary: "#008751", secondary: "#FFFFFF", accent: "#FFFFFF", players: [{ name: "Osimhen", number: 9 }, { name: "Lookman", number: 7 }] },
      ],
    },
    {
      label: "Group F",
      teams: [
        { id: "prt", name: "Portugal", flag: "🇵🇹", primary: "#006600", secondary: "#FFFFFF", accent: "#FF0000", players: [] },
        { id: "bel", name: "Belgium", flag: "🇧🇪", primary: "#000000", secondary: "#FDDA24", accent: "#EF3340", players: [{ name: "De Bruyne", number: 7 }, { name: "Lukaku", number: 9 }] },
        { id: "jpn", name: "Japan", flag: "🇯🇵", primary: "#003DA5", secondary: "#FFFFFF", accent: "#BC002D", players: [{ name: "Mitoma", number: 10 }, { name: "Kubo", number: 9 }] },
        { id: "ecu", name: "Ecuador", flag: "🇪🇨", primary: "#FFD100", secondary: "#034EA2", accent: "#EF3340", players: [{ name: "Valencia", number: 13 }] },
      ],
    },
    {
      label: "Group G",
      teams: [
        { id: "ita", name: "Italy", flag: "🇮🇹", primary: "#003189", secondary: "#FFFFFF", accent: "#009246", players: [{ name: "Barella", number: 18 }, { name: "Chiesa", number: 14 }] },
        { id: "mex2", name: "Mexico", flag: "🇲🇽", primary: "#006847", secondary: "#FFFFFF", accent: "#CE1126", players: [] },
        { id: "kor", name: "South Korea", flag: "🇰🇷", primary: "#C60C30", secondary: "#FFFFFF", accent: "#003478", players: [{ name: "Son", number: 7 }, { name: "Lee", number: 9 }] },
        { id: "cmr", name: "Cameroon", flag: "🇨🇲", primary: "#007A5E", secondary: "#CE1126", accent: "#FCD116", players: [{ name: "Aboubakar", number: 10 }] },
      ],
    },
    {
      label: "Group H",
      teams: [
        { id: "can", name: "Canada", flag: "🇨🇦", primary: "#FF0000", secondary: "#FFFFFF", accent: "#FF0000", players: [{ name: "Davies", number: 19 }, { name: "David", number: 9 }] },
        { id: "den", name: "Denmark", flag: "🇩🇰", primary: "#C60C30", secondary: "#FFFFFF", accent: "#C60C30", players: [{ name: "Eriksen", number: 10 }, { name: "Hojlund", number: 9 }] },
        { id: "srb", name: "Serbia", flag: "🇷🇸", primary: "#C6363C", secondary: "#FFFFFF", accent: "#003DA5", players: [{ name: "Mitrović", number: 9 }, { name: "Vlahović", number: 7 }] },
        { id: "cmr2", name: "Cameroon", flag: "🇨🇲", primary: "#007A5E", secondary: "#CE1126", accent: "#FCD116", players: [] },
      ],
    },
  ],
};
