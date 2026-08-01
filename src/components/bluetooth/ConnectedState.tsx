import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { VODACOM } from "@/constants/theme";
import { SymbolView } from "expo-symbols";

interface ConnectedStateProps {
  onDisconnect: () => void;
  printerName?: string;
}

const ConnectedState: React.FunctionComponent<ConnectedStateProps> = ({
  onDisconnect,
  printerName = "IposPrinter",
}) => {
  return (
    <>
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <SymbolView
            name={{ ios: "checkmark.circle.fill", android: "check_circle" }}
            size={20}
            tintColor={VODACOM.green}
          />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Connected</Text>
            <Text style={styles.statusSubtitle}>{printerName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={onDisconnect}
          style={styles.disconnectButton}
        >
          <SymbolView
            name={{ ios: "xmark.circle.fill", android: "cancel" }}
            size={16}
            tintColor={VODACOM.light}
          />
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default ConnectedState;

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: "row",
    marginTop: 12,
  },
  disconnectButton: {
    flex: 1,
    backgroundColor: VODACOM.red,
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: VODACOM.light,
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: VODACOM.light,
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: VODACOM.dark,
  },
  statusSubtitle: {
    fontSize: 13,
    color: VODACOM.greyDark,
  },
});
