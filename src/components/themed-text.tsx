import { Text, type TextProps, StyleSheet, useColorScheme } from "react-native";
import { useTheme } from "@/context/theme-context";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "title"
    | "subtitle"
    | "small"
    | "smallBold"
    | "code"
    | "link"
    | "linkPrimary";
  themeColor?:
    | "text"
    | "textSecondary"
    | "accent"
    | "success"
    | "warning"
    | "danger";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "small",
  themeColor = "text",
  ...otherProps
}: ThemedTextProps) {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Get the color from theme or use custom colors
  const getColor = () => {
    if (lightColor && !isDark) return lightColor;
    if (darkColor && isDark) return darkColor;

    switch (themeColor) {
      case "textSecondary":
        return colors.textSecondary;
      case "accent":
        return colors.accent;
      case "success":
        return colors.success;
      case "warning":
        return colors.warning;
      case "danger":
        return colors.danger;
      case "text":
      default:
        return colors.text;
    }
  };

  // Get the font style
  const getFontStyle = () => {
    switch (type) {
      case "title":
        return styles.title;
      case "subtitle":
        return styles.subtitle;
      case "small":
        return styles.small;
      case "smallBold":
        return styles.smallBold;
      case "code":
        return styles.code;
      case "link":
        return styles.link;
      case "linkPrimary":
        return styles.linkPrimary;
      default:
        return styles.small;
    }
  };

  return (
    <Text
      style={[getFontStyle(), { color: getColor() }, style]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  code: {
    fontSize: 14,
    fontFamily: "monospace",
  },
  link: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  linkPrimary: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
