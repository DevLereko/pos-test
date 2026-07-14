import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  colors: (typeof Colors)[ThemeType];
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>(
    systemScheme === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    if (systemScheme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(systemScheme === "dark" ? "dark" : "light");
    }
  }, [systemScheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const colors = Colors[theme];
  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider
      value={{ theme, colors, toggleTheme, setTheme, isDark }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
