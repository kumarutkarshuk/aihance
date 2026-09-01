export const colors = {
  background: "#000000",
  foreground: "#f2f2f0",
  muted: "#ffffff8c",
  surface: "rgba(255, 255, 255, 0.08)",
  surfaceBorder: "rgba(255, 255, 255, 0.2)",
  destructive: "#e85d5d",
  destructiveMuted: "#ffffff66",
  placeholder: "#1a1a1a",
  glassBorder: "rgba(255, 255, 255, 0.14)",
  errorBannerBackground: "rgba(232, 93, 93, 0.15)",
  errorBannerText: "#f2b8b5",
} as const;

export const gradients = {
  accent: ["#14b8a6", "#f59e0b", "#ef4444"] as const,
  selectedPill: ["#312e81", "#ea580c"] as const,
};

export const radii = {
  pill: 999,
  glass: 14,
  button: 8,
} as const;

export const fonts = {
  display: "Pacifico_400Regular",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
} as const;

export const splash = {
  durationMs: 800,
  fadeMs: 300,
} as const;
