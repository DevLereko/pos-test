import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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
import { useTheme } from "@/context/theme-context";

// Mock transaction data
const mockTransactions = [
  {
    id: "1",
    customer: "266 588 510 15",
    amount: "M 320.00",
    status: "Completed",
    date: "2026-06-16 14:23",
    type: "Payment",
    reference: "TX-20260616-001",
  },
  {
    id: "2",
    customer: "266 690 204 88",
    amount: "M 48.00",
    status: "Completed",
    date: "2026-06-16 13:45",
    type: "Payment",
    reference: "TX-20260616-002",
  },
  {
    id: "3",
    customer: "266 704 819 21",
    amount: "M 126.50",
    status: "Pending",
    date: "2026-06-16 12:10",
    type: "Payment",
    reference: "TX-20260616-003",
  },
  {
    id: "4",
    customer: "266 502 338 92",
    amount: "M 75.00",
    status: "Failed",
    date: "2026-06-15 17:30",
    type: "Payment",
    reference: "TX-20260615-004",
  },
  {
    id: "5",
    customer: "266 447 221 33",
    amount: "M 540.00",
    status: "Completed",
    date: "2026-06-15 15:20",
    type: "Refund",
    reference: "RF-20260615-001",
  },
];

const filterOptions = ["All", "Completed", "Pending", "Failed"];

export default function HistoryScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const contentInset = {
    ...insets,
    bottom: insets.bottom + BottomTabInset + Spacing.four,
  };

  const filteredTransactions = mockTransactions.filter((tx) => {
    const matchesSearch =
      tx.customer.includes(searchQuery) ||
      tx.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "All" || tx.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return VODACOM.green;
      case "Pending":
        return VODACOM.gold;
      case "Failed":
        return VODACOM.red;
      default:
        return VODACOM.greyDark;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return "checkmark.circle.fill";
      case "Pending":
        return "clock.fill";
      case "Failed":
        return "exclamationmark.circle.fill";
      default:
        return "circle.fill";
    }
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
            <View>
              <ThemedText
                type="title"
                style={[styles.headerTitle, { color: colors.text }]}
              >
                Transaction History
              </ThemedText>
              <ThemedText
                style={[styles.headerSubtitle, { color: colors.textSecondary }]}
              >
                View all your transactions
              </ThemedText>
            </View>
            <Pressable style={styles.filterButton}>
              <AppSymbol
                name={{ ios: "slider.horizontal.3", android: "tune" }}
                size={24}
                tintColor={VODACOM.red}
              />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: isDark ? colors.surfaceStrong : VODACOM.light,
                borderColor: isDark ? colors.surfaceStrong : "#E2E8F0",
              },
            ]}
          >
            <AppSymbol
              name={{ ios: "magnifyingglass", android: "search" }}
              size={20}
              tintColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search by number or reference"
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <AppSymbol
                  name={{ ios: "xmark.circle.fill", android: "close" }}
                  size={20}
                  tintColor={colors.textSecondary}
                />
              </Pressable>
            )}
          </View>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            <View style={styles.filterContainer}>
              {filterOptions.map((filter) => (
                <Pressable
                  key={filter}
                  onPress={() => setSelectedFilter(filter)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceStrong
                        : VODACOM.light,
                    },
                    selectedFilter === filter && styles.filterChipActive,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.filterChipText,
                      {
                        color:
                          selectedFilter === filter
                            ? VODACOM.light
                            : colors.textSecondary,
                      },
                      selectedFilter === filter && styles.filterChipTextActive,
                    ]}
                  >
                    {filter}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Summary Stats */}
          <View
            style={[styles.statsContainer, { backgroundColor: colors.surface }]}
          >
            <View style={styles.statItem}>
              <ThemedText
                type="small"
                style={[styles.statLabel, { color: colors.textSecondary }]}
              >
                Today
              </ThemedText>
              <ThemedText
                type="subtitle"
                style={[styles.statValue, { color: colors.text }]}
              >
                M 494.50
              </ThemedText>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: isDark ? colors.surfaceStrong : "#E2E8F0" },
              ]}
            />
            <View style={styles.statItem}>
              <ThemedText
                type="small"
                style={[styles.statLabel, { color: colors.textSecondary }]}
              >
                Transactions
              </ThemedText>
              <ThemedText
                type="subtitle"
                style={[styles.statValue, { color: colors.text }]}
              >
                8
              </ThemedText>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: isDark ? colors.surfaceStrong : "#E2E8F0" },
              ]}
            />
            <View style={styles.statItem}>
              <ThemedText
                type="small"
                style={[styles.statLabel, { color: colors.textSecondary }]}
              >
                Avg. Ticket
              </ThemedText>
              <ThemedText
                type="subtitle"
                style={[styles.statValue, { color: colors.text }]}
              >
                M 219
              </ThemedText>
            </View>
          </View>

          {/* Transaction List */}
          <View
            style={[
              styles.transactionList,
              { backgroundColor: colors.surface },
            ]}
          >
            {filteredTransactions.length === 0 ? (
              <View style={styles.emptyState}>
                <AppSymbol
                  name={{ ios: "doc.text.magnifyingglass", android: "search" }}
                  size={48}
                  tintColor={colors.textSecondary}
                />
                <ThemedText
                  style={[styles.emptyStateText, { color: colors.text }]}
                >
                  No transactions found
                </ThemedText>
                <ThemedText
                  style={[
                    styles.emptyStateSubtext,
                    { color: colors.textSecondary },
                  ]}
                >
                  Try adjusting your search or filters
                </ThemedText>
              </View>
            ) : (
              filteredTransactions.map((tx, index) => (
                <Pressable
                  key={tx.id}
                  style={({ pressed }) => [
                    styles.transactionItem,
                    pressed && styles.pressed,
                    index < filteredTransactions.length - 1 && [
                      styles.transactionBorder,
                      {
                        borderBottomColor: isDark
                          ? colors.surfaceStrong
                          : "#F1F5F9",
                      },
                    ],
                  ]}
                >
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.transactionIcon,
                        { backgroundColor: `${getStatusColor(tx.status)}15` },
                      ]}
                    >
                      <AppSymbol
                        name={getStatusIcon(tx.status) as any}
                        size={20}
                        tintColor={getStatusColor(tx.status)}
                      />
                    </View>
                    <View>
                      <ThemedText
                        type="smallBold"
                        style={[styles.customerText, { color: colors.text }]}
                      >
                        {tx.customer}
                      </ThemedText>
                      <View style={styles.transactionMeta}>
                        <ThemedText
                          type="small"
                          style={[
                            styles.referenceText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {tx.reference}
                        </ThemedText>
                        <View
                          style={[
                            styles.metaDot,
                            { backgroundColor: colors.textSecondary },
                          ]}
                        />
                        <ThemedText
                          type="small"
                          style={[
                            styles.dateText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {tx.date}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <ThemedText
                      type="subtitle"
                      style={[styles.amountText, { color: colors.text }]}
                    >
                      {tx.amount}
                    </ThemedText>
                    <View style={styles.statusBadge}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(tx.status) },
                        ]}
                      />
                      <ThemedText
                        type="small"
                        style={[
                          styles.statusText,
                          { color: getStatusColor(tx.status) },
                        ]}
                      >
                        {tx.status}
                      </ThemedText>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>

          {/* Load More */}
          {filteredTransactions.length > 0 && (
            <Pressable
              style={[
                styles.loadMoreButton,
                {
                  borderColor: isDark ? colors.surfaceStrong : "#E2E8F0",
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <ThemedText style={[styles.loadMoreText, { color: VODACOM.red }]}>
                Load More
              </ThemedText>
              <AppSymbol
                name={{ ios: "arrow.down.circle", android: "expand_more" }}
                size={16}
                tintColor={VODACOM.red}
              />
            </Pressable>
          )}
        </View>
      </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.three,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  filterScroll: {
    marginHorizontal: -Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: VODACOM.red,
    borderColor: VODACOM.red,
  },
  filterChipText: {
    fontSize: 14,
  },
  filterChipTextActive: {
    color: VODACOM.light,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 16,
    padding: Spacing.three,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statDivider: {
    width: 1,
  },
  transactionList: {
    borderRadius: 16,
    padding: Spacing.three,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  transactionBorder: {
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  customerText: {
    fontSize: 14,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  referenceText: {
    fontSize: 12,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  dateText: {
    fontSize: 12,
  },
  transactionRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyStateSubtext: {
    fontSize: 14,
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
