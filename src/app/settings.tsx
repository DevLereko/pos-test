import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppSymbol } from "@/components/app-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BottomTabInset,
  MaxContentWidth,
  Spacing,
  VODACOM,
} from "@/constants/theme";
import { useConfig } from "@/context/config-context";
import { useTheme } from "@/context/theme-context";

// Edit Modal Component
function EditModal({
  visible,
  onClose,
  onSave,
  title,
  value,
  label,
  keyboardType = "default",
  multiline = false,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  title: string;
  value: string;
  label: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  multiline?: boolean;
}) {
  const [inputValue, setInputValue] = useState(value);
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.surface }]}
        >
          <ThemedText type="subtitle" style={styles.modalTitle}>
            {title}
          </ThemedText>

          <View style={styles.modalField}>
            <ThemedText type="smallBold" style={styles.modalLabel}>
              {label}
            </ThemedText>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.textSecondary,
                },
              ]}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType={keyboardType}
              multiline={multiline}
              numberOfLines={multiline ? 3 : 1}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.modalActions}>
            <Pressable
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onClose}
            >
              <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.modalButton, styles.modalSaveButton]}
              onPress={() => {
                onSave(inputValue);
                onClose();
              }}
            >
              <ThemedText style={styles.modalSaveText}>Save</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { config, updateConfig } = useConfig();
  const insets = useSafeAreaInsets();

  const [editingField, setEditingField] = useState<{
    section: string;
    field: string;
    value: string;
    label: string;
    keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
    multiline?: boolean;
  } | null>(null);

  const contentInset = {
    ...insets,
    bottom: insets.bottom + BottomTabInset + Spacing.four,
  };

  const handleEdit = (
    section: string,
    field: string,
    value: string,
    label: string,
    keyboardType:
      | "default"
      | "numeric"
      | "email-address"
      | "phone-pad" = "default",
    multiline: boolean = false,
  ) => {
    setEditingField({ section, field, value, label, keyboardType, multiline });
  };

  const handleSaveEdit = (newValue: string) => {
    if (!editingField) return;

    const { section, field } = editingField;
    const updates: any = {};

    if (section === "merchant") {
      updates.merchant = { ...config.merchant, [field]: newValue };
    } else if (section === "server") {
      updates.server = { ...config.server, [field]: newValue };
    } else if (section === "printer") {
      updates.printer = { ...config.printer, [field]: newValue };
    }

    updateConfig(updates);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => console.log("Logout"),
      },
    ]);
  };

  const handleResetConfig = () => {
    Alert.alert(
      "Reset Configuration",
      "This will reset all settings to default. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => updateConfig({} as any),
        },
      ],
    );
  };

  return (
    <ThemedView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, contentInset]}
      >
        <View style={styles.shell}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText
              type="title"
              style={[styles.headerTitle, { color: colors.text }]}
            >
              Settings
            </ThemedText>
            <ThemedText
              style={[styles.headerSubtitle, { color: colors.textSecondary }]}
            >
              Configure your POS system
            </ThemedText>
          </View>

          {/* Merchant Configuration */}
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              Merchant Details
            </ThemedText>
            <View
              style={[
                styles.sectionContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              {[
                {
                  key: "name",
                  label: "Business Name",
                  value: config.merchant.name,
                  keyboardType: "default",
                },
                {
                  key: "terminalId",
                  label: "Terminal ID",
                  value: config.merchant.terminalId,
                  keyboardType: "default",
                },
                {
                  key: "phoneNumber",
                  label: "Phone Number",
                  value: config.merchant.phoneNumber,
                  keyboardType: "phone-pad",
                },
                {
                  key: "email",
                  label: "Email Address",
                  value: config.merchant.email,
                  keyboardType: "email-address",
                },
                {
                  key: "address",
                  label: "Business Address",
                  value: config.merchant.address,
                  keyboardType: "default",
                  multiline: true,
                },
              ].map((item, index) => (
                <Pressable
                  key={item.key}
                  onPress={() =>
                    handleEdit(
                      "merchant",
                      item.key,
                      item.value,
                      item.label,
                      item.keyboardType as any,
                      item.multiline || false,
                    )
                  }
                  style={({ pressed }) => [
                    styles.settingItem,
                    pressed && styles.pressed,
                    index < 4 && styles.settingBorder,
                  ]}
                >
                  <View style={styles.settingLeft}>
                    <ThemedText
                      style={[styles.settingLabel, { color: colors.text }]}
                    >
                      {item.label}
                    </ThemedText>
                  </View>
                  <View style={styles.settingRight}>
                    <ThemedText
                      style={[
                        styles.settingValue,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.value}
                    </ThemedText>
                    <AppSymbol
                      name={{ ios: "chevron.right", android: "arrow_forward" }}
                      size={16}
                      tintColor={colors.textSecondary}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Server Configuration */}
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              Server Configuration
            </ThemedText>
            <View
              style={[
                styles.sectionContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              {[
                {
                  key: "apiUrl",
                  label: "API URL",
                  value: config.server.apiUrl,
                  keyboardType: "default",
                },
                {
                  key: "soapUrl",
                  label: "SOAP URL",
                  value: config.server.soapUrl,
                  keyboardType: "default",
                },
                {
                  key: "timeout",
                  label: "Timeout (ms)",
                  value: String(config.server.timeout),
                  keyboardType: "numeric",
                },
                {
                  key: "retryAttempts",
                  label: "Retry Attempts",
                  value: String(config.server.retryAttempts),
                  keyboardType: "numeric",
                },
              ].map((item, index) => (
                <Pressable
                  key={item.key}
                  onPress={() =>
                    handleEdit(
                      "server",
                      item.key,
                      item.value,
                      item.label,
                      item.keyboardType as any,
                    )
                  }
                  style={({ pressed }) => [
                    styles.settingItem,
                    pressed && styles.pressed,
                    index < 3 && styles.settingBorder,
                  ]}
                >
                  <View style={styles.settingLeft}>
                    <ThemedText
                      style={[styles.settingLabel, { color: colors.text }]}
                    >
                      {item.label}
                    </ThemedText>
                  </View>
                  <View style={styles.settingRight}>
                    <ThemedText
                      style={[
                        styles.settingValue,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.value}
                    </ThemedText>
                    <AppSymbol
                      name={{ ios: "chevron.right", android: "arrow_forward" }}
                      size={16}
                      tintColor={colors.textSecondary}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Printer Configuration */}
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              Printer Settings
            </ThemedText>
            <View
              style={[
                styles.sectionContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              {[
                {
                  key: "name",
                  label: "Printer Name",
                  value: config.printer.name,
                  keyboardType: "default",
                },
                {
                  key: "paperSize",
                  label: "Paper Size",
                  value: config.printer.paperSize,
                  keyboardType: "default",
                },
                {
                  key: "copies",
                  label: "Receipt Copies",
                  value: String(config.printer.copies),
                  keyboardType: "numeric",
                },
              ].map((item, index) => (
                <Pressable
                  key={item.key}
                  onPress={() =>
                    handleEdit(
                      "printer",
                      item.key,
                      item.value,
                      item.label,
                      item.keyboardType as any,
                    )
                  }
                  style={({ pressed }) => [
                    styles.settingItem,
                    pressed && styles.pressed,
                    index < 2 && styles.settingBorder,
                  ]}
                >
                  <View style={styles.settingLeft}>
                    <ThemedText
                      style={[styles.settingLabel, { color: colors.text }]}
                    >
                      {item.label}
                    </ThemedText>
                  </View>
                  <View style={styles.settingRight}>
                    <ThemedText
                      style={[
                        styles.settingValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.value}
                    </ThemedText>
                    <AppSymbol
                      name={{ ios: "chevron.right", android: "arrow_forward" }}
                      size={16}
                      tintColor={colors.textSecondary}
                    />
                  </View>
                </Pressable>
              ))}
              <View style={[styles.settingItem, styles.settingBorder]}>
                <View style={styles.settingLeft}>
                  <ThemedText
                    style={[styles.settingLabel, { color: colors.text }]}
                  >
                    Auto Connect
                  </ThemedText>
                </View>
                <Switch
                  value={config.printer.autoConnect}
                  onValueChange={(value) =>
                    updateConfig({
                      printer: { ...config.printer, autoConnect: value },
                    })
                  }
                  trackColor={{ false: "#E2E8F0", true: VODACOM.red }}
                  thumbColor={VODACOM.light}
                  ios_backgroundColor="#E2E8F0"
                />
              </View>
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionTitle, { color: colors.textSecondary }]}
            >
              Preferences
            </ThemedText>
            <View
              style={[
                styles.sectionContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              {[
                {
                  key: "autoPrint",
                  label: "Auto Print Receipt",
                  value: config.preferences.autoPrint,
                },
                {
                  key: "soundEffects",
                  label: "Sound Effects",
                  value: config.preferences.soundEffects,
                },
                {
                  key: "offlineMode",
                  label: "Offline Mode",
                  value: config.preferences.offlineMode,
                },
                {
                  key: "darkMode",
                  label: "Dark Mode",
                  value: config.preferences.darkMode,
                },
                {
                  key: "biometricAuth",
                  label: "Biometric Authentication",
                  value: config.preferences.biometricAuth,
                },
              ].map((item, index) => (
                <View
                  key={item.key}
                  style={[
                    styles.settingItem,
                    index < 4 && styles.settingBorder,
                  ]}
                >
                  <View style={styles.settingLeft}>
                    <ThemedText
                      style={[styles.settingLabel, { color: colors.text }]}
                    >
                      {item.label}
                    </ThemedText>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={(value) => {
                      const preferences = {
                        ...config.preferences,
                        [item.key]: value,
                      };
                      updateConfig({ preferences });
                      // If dark mode toggled, update theme
                      if (item.key === "darkMode") {
                        toggleTheme();
                      }
                    }}
                    trackColor={{ false: "#E2E8F0", true: VODACOM.red }}
                    thumbColor={VODACOM.light}
                    ios_backgroundColor="#E2E8F0"
                  />
                </View>
              ))}
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <ThemedText
                    style={[styles.settingLabel, { color: colors.text }]}
                  >
                    Session Timeout
                  </ThemedText>
                </View>
                <View style={styles.settingRight}>
                  <ThemedText
                    style={[
                      styles.settingValue,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {config.preferences.sessionTimeout} min
                  </ThemedText>
                  <Pressable
                    onPress={() => {
                      const current = config.preferences.sessionTimeout;
                      const options = [1, 5, 10, 15, 30];
                      const next =
                        options[
                          (options.indexOf(current) + 1) % options.length
                        ];
                      const preferences = {
                        ...config.preferences,
                        sessionTimeout: next,
                      };
                      updateConfig({ preferences });
                    }}
                  >
                    <AppSymbol
                      name={{ ios: "chevron.right", android: "arrow_forward" }}
                      size={16}
                      tintColor={colors.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Pressable
              onPress={handleResetConfig}
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.pressed,
              ]}
            >
              <AppSymbol
                name={{ ios: "arrow.counterclockwise", android: "refresh" }}
                size={20}
                tintColor={VODACOM.red}
              />
              <ThemedText style={[styles.resetText, { color: VODACOM.red }]}>
                Reset to Default Settings
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.pressed,
              ]}
            >
              <AppSymbol
                name={{
                  ios: "rectangle.portrait.and.arrow.right",
                  android: "logout",
                }}
                size={20}
                tintColor={VODACOM.red}
              />
              <ThemedText style={[styles.logoutText, { color: VODACOM.red }]}>
                Logout
              </ThemedText>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText
              style={[styles.footerText, { color: colors.textSecondary }]}
            >
              M-Pesa POS v2.0.0
            </ThemedText>
            <ThemedText
              style={[styles.footerSubtext, { color: colors.textSecondary }]}
            >
              Vodacom Lesotho
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      {editingField && (
        <EditModal
          visible={!!editingField}
          onClose={() => setEditingField(null)}
          onSave={handleSaveEdit}
          title={`Edit ${editingField.label}`}
          value={editingField.value}
          label={editingField.label}
          keyboardType={editingField.keyboardType || "default"}
          multiline={editingField.multiline || false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  shell: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  header: {
    paddingTop: Spacing.three,
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContainer: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    minHeight: 52,
  },
  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  settingValue: {
    fontSize: 14,
    maxWidth: 150,
  },
  pressed: {
    opacity: 0.7,
  },
  actionsContainer: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: VODACOM.redLight,
    backgroundColor: VODACOM.light,
  },
  resetText: {
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: VODACOM.redLight,
    backgroundColor: VODACOM.light,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
    gap: 4,
  },
  footerText: {
    fontSize: 14,
  },
  footerSubtext: {
    fontSize: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  modalField: {
    gap: 8,
  },
  modalLabel: {
    fontSize: 14,
  },
  modalInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 48,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#F1F5F9",
  },
  modalCancelText: {
    color: "#64748B",
    fontWeight: "600",
  },
  modalSaveButton: {
    backgroundColor: VODACOM.red,
  },
  modalSaveText: {
    color: VODACOM.light,
    fontWeight: "600",
  },
});
