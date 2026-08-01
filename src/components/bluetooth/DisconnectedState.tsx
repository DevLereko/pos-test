import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { StrippedPeripheral } from "@/types/bluetooth";
import PeripheralList from "./PeripheralList";
import { VODACOM } from "@/constants/theme";
import { SymbolView } from "expo-symbols";

interface DisconnectedStateProps {
  peripherals: StrippedPeripheral[];
  isScanning: boolean;
  onScanPress: () => void;
  onConnect: (peripheral: StrippedPeripheral) => Promise<void>;
}

const DisconnectedState: React.FunctionComponent<DisconnectedStateProps> = ({
  isScanning,
  onScanPress,
  peripherals,
  onConnect,
}) => {
  return (
    <>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={onScanPress}
        disabled={isScanning}
      >
        <SymbolView
          name={{ ios: "arrow.clockwise", android: "refresh" }}
          size={18}
          tintColor={VODACOM.light}
        />
        <Text style={styles.scanButtonText}>
          {isScanning ? "Scanning..." : "Refresh Devices"}
        </Text>
      </TouchableOpacity>

      {peripherals.length > 0 ? (
        <PeripheralList onConnect={onConnect} peripherals={peripherals} />
      ) : (
        <View style={styles.emptyContainer}>
          <SymbolView
            name={{ ios: "printer", android: "print" }}
            size={40}
            tintColor={VODACOM.greyDark}
          />
          <Text style={styles.emptyText}>No printers found</Text>
          <Text style={styles.emptySubtext}>
            Please pair your printer in device Bluetooth settings
          </Text>
        </View>
      )}
    </>
  );
};

export default DisconnectedState;

const styles = StyleSheet.create({
  scanButton: {
    backgroundColor: VODACOM.red,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  scanButtonText: {
    color: VODACOM.light,
    fontSize: 15,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: VODACOM.dark,
  },
  emptySubtext: {
    fontSize: 13,
    color: VODACOM.greyDark,
    textAlign: "center",
  },
});
