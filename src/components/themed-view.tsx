import { useTheme } from "@/context/theme-context";
import { useColorScheme, View, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "surface"
    | "background"
    | "backgroundElement"
    | "backgroundSelected"
    | "surfaceStrong";
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  type = "background",
  ...otherProps
}: ThemedViewProps) {
  const { colors } = useTheme();
  const isDark = useColorScheme() === "dark";

  // Get the background color from theme or use custom colors
  const getBackgroundColor = () => {
    if (lightColor && !isDark) return lightColor;
    if (darkColor && isDark) return darkColor;

    switch (type) {
      case "surface":
        return colors.surface;
      case "surfaceStrong":
        return colors.surfaceStrong;
      case "backgroundElement":
        return colors.backgroundElement;
      case "backgroundSelected":
        return colors.backgroundSelected;
      case "background":
      default:
        return colors.background;
    }
  };

  return (
    <View
      style={[{ backgroundColor: getBackgroundColor() }, style]}
      {...otherProps}
    />
  );
}
