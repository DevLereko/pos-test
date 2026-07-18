import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { Spacing, VODACOM } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";

export interface Merchant {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  location: string;
  district: string;
  businessType: string;
  assignedAt?: string;
  assignedBy?: string;
}

interface MerchantSelectorProps {
  visible: boolean;
  merchants: Merchant[];
  onSelect: (merchant: Merchant) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

export function MerchantSelector({
  visible,
  merchants,
  onSelect,
  onClose,
  title = "Select Merchant",
  subtitle = "Choose which merchant to associate with this device",
  loading = false,
}: MerchantSelectorProps) {
  const { colors } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Reset selection when modal opens
  const handleModalOpen = () => {
    setSelectedId(null);
  };

  const activeMerchants = merchants.filter((m) => m.isActive);
  const displayMerchants =
    activeMerchants.length > 0 ? activeMerchants : merchants;

  const handleSelect = () => {
    if (selectedId) {
      const merchant = merchants.find((m) => m.id === selectedId);
      if (merchant) {
        onSelect(merchant);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleModalOpen}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          <TouchableWithoutFeedback>
            <View
              style={[styles.container, { backgroundColor: colors.surface }]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View
                  style={[
                    styles.headerIcon,
                    { backgroundColor: `${VODACOM.red}15` },
                  ]}
                >
                  <SymbolView
                    name={{ ios: "storefront.fill", android: "store" }}
                    size={24}
                    tintColor={VODACOM.red}
                  />
                </View>
                <ThemedText type="subtitle" style={styles.headerTitle}>
                  {title}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.headerSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {subtitle}
                </ThemedText>
              </View>

              {/* Merchant List */}
              <ScrollView
                style={styles.merchantList}
                showsVerticalScrollIndicator={false}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ThemedText
                      style={[
                        styles.loadingText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Loading merchants...
                    </ThemedText>
                  </View>
                ) : displayMerchants.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <ThemedText
                      style={[
                        styles.emptyText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      No merchants available
                    </ThemedText>
                  </View>
                ) : (
                  displayMerchants.map((merchant) => (
                    <Pressable
                      key={merchant.id}
                      style={({ pressed }) => [
                        styles.merchantItem,
                        pressed && styles.pressed,
                        selectedId === merchant.id &&
                          styles.merchantItemSelected,
                      ]}
                      onPress={() => setSelectedId(merchant.id)}
                    >
                      <View style={styles.merchantContent}>
                        <View style={styles.merchantInfo}>
                          <View style={styles.merchantHeader}>
                            <ThemedText
                              style={[
                                styles.merchantName,
                                { color: colors.text },
                              ]}
                            >
                              {merchant.name}
                            </ThemedText>
                            <View
                              style={[
                                styles.statusBadge,
                                {
                                  backgroundColor: merchant.isActive
                                    ? `${VODACOM.green}15`
                                    : `${VODACOM.red}15`,
                                },
                              ]}
                            >
                              <View
                                style={[
                                  styles.statusDot,
                                  {
                                    backgroundColor: merchant.isActive
                                      ? VODACOM.green
                                      : VODACOM.red,
                                  },
                                ]}
                              />
                              <ThemedText
                                style={[
                                  styles.statusText,
                                  {
                                    color: merchant.isActive
                                      ? VODACOM.green
                                      : VODACOM.red,
                                  },
                                ]}
                              >
                                {merchant.isActive ? "Active" : "Inactive"}
                              </ThemedText>
                            </View>
                          </View>
                          <ThemedText
                            style={[
                              styles.merchantCode,
                              { color: colors.textSecondary },
                            ]}
                          >
                            Code: {merchant.code}
                          </ThemedText>
                          <ThemedText
                            style={[
                              styles.merchantLocation,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {merchant.location}, {merchant.district}
                          </ThemedText>
                          <ThemedText
                            style={[
                              styles.merchantType,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {merchant.businessType}
                          </ThemedText>
                        </View>
                        {selectedId === merchant.id && (
                          <View
                            style={[
                              styles.checkmark,
                              { backgroundColor: VODACOM.red },
                            ]}
                          >
                            <SymbolView
                              name={{ ios: "checkmark", android: "check" }}
                              size={16}
                              tintColor={VODACOM.light}
                            />
                          </View>
                        )}
                      </View>
                    </Pressable>
                  ))
                )}
              </ScrollView>

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable
                  style={[
                    styles.cancelButton,
                    { borderColor: colors.textSecondary },
                  ]}
                  onPress={onClose}
                >
                  <ThemedText
                    style={[styles.cancelText, { color: colors.textSecondary }]}
                  >
                    Cancel
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.confirmButton,
                    { backgroundColor: VODACOM.red },
                    !selectedId && styles.confirmButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                  onPress={handleSelect}
                  disabled={!selectedId}
                >
                  <ThemedText
                    style={[styles.confirmText, { color: VODACOM.light }]}
                  >
                    Select Merchant
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  merchantList: {
    maxHeight: 400,
  },
  loadingContainer: {
    padding: Spacing.four,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: Spacing.four,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
  merchantItem: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginBottom: 8,
    padding: Spacing.three,
  },
  merchantItemSelected: {
    borderColor: VODACOM.red,
    borderWidth: 2,
  },
  merchantContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  merchantInfo: {
    flex: 1,
    gap: 4,
  },
  merchantHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  merchantName: {
    fontSize: 16,
    fontWeight: "600",
  },
  merchantCode: {
    fontSize: 13,
  },
  merchantLocation: {
    fontSize: 13,
  },
  merchantType: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.7,
  },
});
