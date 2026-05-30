export const colors = {
  // Base surfaces
  base: "#0F2418",
  surface: "#162E20",
  surfaceElevated: "#1C3828",

  // Borders
  border: "#2A4A35",
  borderSubtle: "#1F3D29",

  // Text
  textPrimary: "#F0F7F2",
  textSecondary: "#8AAF95",
  textTertiary: "#4A6B55",
  textDisabled: "#2E4D38",

  // Semantic
  success: "#4ADE80",
  successDim: "rgba(74, 222, 128, 0.12)",
  warning: "#FBBF24",
  warningDim: "rgba(251, 191, 36, 0.1)",
  error: "#F87171",
  errorDim: "rgba(248, 113, 113, 0.1)",

  // Accent
  accent: "#F0F7F2",
  accentDim: "rgba(240, 247, 242, 0.08)",
} as const;

export const spacing = {
  unit: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
} as const;

export const typography = {
  fontSize: {
    xs: "10px",
    sm: "12px",
    base: "14px",
    lg: "16px",
    xl: "18px",
    "2xl": "22px",
    "3xl": "28px",
    "4xl": "32px",
    "5xl": "42px",
  },
  fontWeight: {
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
} as const;

export const tw = {
  sectionLabel: "text-[10px] font-bold uppercase tracking-[0.12em] text-[#4A6B55]",
  heroStatLabel: "text-[10px] font-bold uppercase tracking-[0.12em] text-[#4A6B55]",
} as const;
