import { StrippedPeripheral } from "@/types/bluetooth";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { VODACOM } from "@/constants/theme";
import { SymbolView } from "expo-symbols";

interface PeripheralListProps {
  peripherals: StrippedPeripheral[];
  onConnect: (peripheral: StrippedPeripheral) => Promise<void>;
}

const PeripheralList: React.FC<PeripheralListProps> = ({
  peripherals,
  onConnect,
}) => {
  const printerDevices = peripherals.filter(
    (p) =>
      p.name?.toLowerCase().includes("printer") ||
      p.name?.toLowerCase().includes("ipos") ||
      p.name?.toLowerCase().includes("blue") ||
      p.name?.toLowerCase().includes("bt"),
  );

  const displayDevices =
    printerDevices.length > 0 ? printerDevices : peripherals;

  return (
    <FlatList
      data={displayDevices}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => onConnect(item)}
          style={styles.card}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <SymbolView
                name={{ ios: "printer.fill", android: "print" }}
                size={20}
                tintColor={VODACOM.red}
              />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.title}>{item.name || "Unknown Device"}</Text>
              <Text style={styles.info}>{item.id}</Text>
            </View>
            <SymbolView
              name={{ ios: "chevron.right", android: "arrow_forward" }}
              size={16}
              tintColor={VODACOM.greyDark}
            />
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: VODACOM.light,
    padding: 14,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${VODACOM.red}10`,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: VODACOM.dark,
  },
  info: {
    fontSize: 12,
    color: VODACOM.greyDark,
  },
});

export default PeripheralList;
