import { Image, StyleSheet, View } from "react-native";
import { VODACOM, Spacing } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

interface AppLogoProps {
  size?: "small" | "medium" | "large";
}

export function AppLogo({ size = "medium" }: AppLogoProps) {
  const { colors } = useTheme();

  const getSize = () => {
    switch (size) {
      case "small":
        return { circle: 56, image: 36, fontSize: 18 };
      case "large":
        return { circle: 96, image: 64, fontSize: 28 };
      default:
        return { circle: 72, image: 48, fontSize: 22 };
    }
  };

  const sizes = getSize();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.logoCircle,
          {
            width: sizes.circle,
            height: sizes.circle,
            borderRadius: sizes.circle / 2.5,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={[
            styles.logoImage,
            {
              width: sizes.image,
              height: sizes.image,
            },
          ]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.two,
  },
  logoCircle: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  logoImage: {
    tintColor: VODACOM.red,
  },
  textContainer: {
    alignItems: "center",
    gap: 2,
  },
  logoText: {
    fontWeight: "700",
  },
  logoSubtext: {
    fontWeight: "400",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
