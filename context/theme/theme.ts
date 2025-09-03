export type Theme = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryLight?: string;
  accent: string;
  accentLight?: string;
};

export const themes: Record<string, Theme> = {
  system: {
    // This one will be handled by Appearance.getColorScheme()
    background: "transparent",
    card: "transparent",
    text: "transparent",
    textSecondary: "transparent",
    primary: "transparent",
    accent: "transparent",
  },
  dark: {
    background: "#0d0d0d",
    card: "#1a1a1a",
    text: "#ffffff",
    textSecondary: "#cccccc",
    primary: "#ffffff",
    accent: "#6B7A5A",
  },
  light: {
    background: "#ffffff",
    card: "#f2f2f2",
    text: "#0d0d0d",
    textSecondary: "#333333",
    primary: "#0d0d0d",
    accent: "#6B7A5A",
  },
  fancy: {
    background: "#FCF4EC", // gold
    card: "#F0F4E8", // olive/greenish
    text: "#000000", // black
    textSecondary: "#333333",
    primary: "#C29B61",
    primaryLight: "#FCF4EC",
    accent: "#6B7A5A",
    accentLight: "#F0F4E8",
  },
};
