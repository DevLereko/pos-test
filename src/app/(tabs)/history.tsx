import { useState, useEffect, useCallback } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  ActivityIndicator,
  RefreshControl,
  Animated,
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
import { useAuth } from "@/context/auth-context";
import { useMerchant } from "@/context/merchant-context";
import { authApi, Transaction } from "@/api/auth";

const filterOptions = ["All", "Completed", "Pending", "Failed", "Refunded"];

export default function HistoryScreen() {
  const { colors, isDark } = useTheme();
  const { merchantInfo } = useAuth();
  const { selectedMerchant } = useMerchant();
  const insets = useSafeAreaInsets();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    completedCount: 0,
    failedCount: 0,
    pendingCount: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [animatedValues, setAnimatedValues] = useState<{
    [key: string]: Animated.Value;
  }>({});

  const contentInset = {
    ...insets,
    bottom: insets.bottom + BottomTabInset + Spacing.five,
  };

  const getMerchantId = useCallback(() => {
    return selectedMerchant?.id || merchantInfo?.id || merchantInfo?.merchantId;
  }, [selectedMerchant, merchantInfo]);

  const fetchTransactions = useCallback(
    async (page = 1, refresh = false) => {
      const merchantId = getMerchantId();
      if (!merchantId) {
        console.warn("No merchant ID available");
        setIsLoading(false);
        return;
      }

      try {
        if (page === 1 && !refresh) {
          setIsLoading(true);
        }

        const response = await authApi.getTransactions(merchantId, {
          page,
          limit: 10,
          status: selectedFilter === "All" ? undefined : selectedFilter,
          search: searchQuery || undefined,
        });

        if (page === 1) {
          setTransactions(response.transactions);
          const newAnimatedValues: { [key: string]: Animated.Value } = {};
          response.transactions.forEach((tx: Transaction) => {
            newAnimatedValues[tx.id] = new Animated.Value(0);
          });
          setAnimatedValues(newAnimatedValues);
        } else {
          setTransactions((prev) => [...prev, ...response.transactions]);
          const newAnimatedValues = { ...animatedValues };
          response.transactions.forEach((tx: Transaction) => {
            if (!newAnimatedValues[tx.id]) {
              newAnimatedValues[tx.id] = new Animated.Value(0);
            }
          });
          setAnimatedValues(newAnimatedValues);
        }

        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
          hasNext: response.pagination.hasNext,
          hasPrevious: response.pagination.hasPrevious,
        });

        if (response.summary) {
          setSummary(response.summary);
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [getMerchantId, selectedFilter, searchQuery],
  );

  useEffect(() => {
    fetchTransactions(1);
  }, [selectedFilter, searchQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTransactions(1, true);
  };

  const handleLoadMore = () => {
    if (pagination.hasNext && !isLoading) {
      fetchTransactions(pagination.page + 1);
    }
  };

  const toggleExpand = (transactionId: string) => {
    const isExpanded = expandedId === transactionId;

    const animValue = animatedValues[transactionId];
    if (animValue) {
      Animated.spring(animValue, {
        toValue: isExpanded ? 0 : 1,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }).start();
    }

    setExpandedId(isExpanded ? null : transactionId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return VODACOM.green;
      case "pending":
        return VODACOM.gold;
      case "failed":
        return VODACOM.red;
      case "refunded":
        return "#8B5CF6";
      default:
        return VODACOM.greyDark;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "checkmark.circle.fill";
      case "pending":
        return "clock.fill";
      case "failed":
        return "exclamationmark.circle.fill";
      case "refunded":
        return "arrow.uturn.left.circle.fill";
      default:
        return "circle.fill";
    }
  };

  const formatAmount = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `M ${num.toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-LS", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusCount = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return summary.completedCount;
      case "pending":
        return summary.pendingCount;
      case "failed":
        return summary.failedCount;
      default:
        return 0;
    }
  };

  const getDisplayMerchant = () => {
    return (
      selectedMerchant?.name ||
      merchantInfo?.name ||
      merchantInfo?.businessName ||
      "N/A"
    );
  };

  const getDisplayMerchantCode = () => {
    return (
      <ThemedText style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "500" }}>
        {selectedMerchant?.code || merchantInfo?.code || "N/A"}
      </ThemedText>
    );
  };

  const getFilterCount = (filter: string) => {
    if (filter === "All") return pagination.total;
    return getStatusCount(filter);
  };

  const renderExpandedDetails = (transaction: Transaction) => {
    const isExpanded = expandedId === transaction.id;
    const animValue = animatedValues[transaction.id] || new Animated.Value(0);

    const height = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 300],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    if (!isExpanded) return null;

    return (
      <Animated.View
        style={[
          styles.expandedContainer,
          {
            height,
            opacity,
            backgroundColor: isDark ? colors.surfaceStrong : VODACOM.grey,
          },
        ]}
      >
        <ScrollView
          style={styles.expandedScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.expandedContent}>
            <View style={styles.expandedRow}>
              <ThemedText
                style={[styles.expandedLabel, { color: colors.textSecondary }]}
              >
                Reference
              </ThemedText>
              <ThemedText
                style={[styles.expandedValue, { color: colors.text }]}
                numberOfLines={1}
              >
                {transaction.reference}
              </ThemedText>
            </View>

            <View style={styles.expandedRow}>
              <ThemedText
                style={[styles.expandedLabel, { color: colors.textSecondary }]}
              >
                Customer
              </ThemedText>
              <ThemedText
                style={[styles.expandedValue, { color: colors.text }]}
                numberOfLines={1}
              >
                {transaction.customerPhone}
              </ThemedText>
            </View>

            <View style={styles.expandedRow}>
              <ThemedText
                style={[styles.expandedLabel, { color: colors.textSecondary }]}
              >
                Amount
              </ThemedText>
              <ThemedText
                style={[styles.expandedValue, { color: colors.text }]}
                numberOfLines={1}
              >
                {formatAmount(transaction.amount)}
              </ThemedText>
            </View>

            <View style={styles.expandedRow}>
              <ThemedText
                style={[styles.expandedLabel, { color: colors.textSecondary }]}
              >
                Status
              </ThemedText>
              <View style={styles.expandedStatusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(transaction.status) },
                  ]}
                />
                <ThemedText
                  style={[
                    styles.expandedValue,
                    { color: getStatusColor(transaction.status) },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formatStatus(transaction.status)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.expandedRow}>
              <ThemedText
                style={[styles.expandedLabel, { color: colors.textSecondary }]}
              >
                Response
              </ThemedText>
              <ThemedText
                style={[styles.expandedValue, { color: colors.text }]}
                numberOfLines={1}
              >
                {transaction.responseMessage || "N/A"}
              </ThemedText>
            </View>

            <View style={styles.expandedRow}>
              <ThemedText
                style={[styles.expandedLabel, { color: colors.textSecondary }]}
              >
                Response Code
              </ThemedText>
              <ThemedText
                style={[styles.expandedValue, { color: colors.text }]}
                numberOfLines={1}
              >
                {transaction.responseCode || "N/A"}
              </ThemedText>
            </View>

            <View style={styles.expandedRow}>
              <ThemedText
                style={[styles.expandedLabel, { color: colors.textSecondary }]}
              >
                Device
              </ThemedText>
              <ThemedText
                style={[
                  styles.expandedValue,
                  { color: colors.text },
                ]}
                numberOfLines={1}
              >
                {transaction.device?.deviceName || "N/A"} • Terminal{" "}
                {transaction.device?.terminalId || "N/A"}
              </ThemedText>
            </View>

            <View style={styles.expandedRow}>
              <ThemedText
                style={[styles.expandedLabel, { color: colors.textSecondary }]}
              >
                Processed At
              </ThemedText>
              <ThemedText
                style={[styles.expandedValue, { color: colors.text }]}
                numberOfLines={1}
              >
                {transaction.processedAt
                  ? formatDate(transaction.processedAt)
                  : "N/A"}
              </ThemedText>
            </View>

            {transaction.ipAddress && (
              <View style={styles.expandedRow}>
                <ThemedText
                  style={[styles.expandedLabel, { color: colors.textSecondary }]}
                >
                  IP Address
                </ThemedText>
                <ThemedText
                  style={[styles.expandedValue, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {transaction.ipAddress}
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, contentInset]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={VODACOM.red}
            colors={[VODACOM.red]}
          />
        }
      >
        <View style={styles.shell}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText
                type="title"
                style={[styles.headerTitle, { color: colors.text }]}
              >
                Transactions
              </ThemedText>
              <ThemedText
                style={[styles.headerSubtitle, { color: colors.textSecondary }]}
              >
                {getDisplayMerchant()} - {getDisplayMerchantCode()}
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
              placeholder="Search by customer or reference"
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
              {filterOptions.map((filter) => {
                const count = getFilterCount(filter);
                return (
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
                      ]}
                      numberOfLines={1}
                    >
                      {filter}
                      {count > 0 && (
                        <ThemedText
                          style={[
                            styles.filterChipCount,
                            {
                              color:
                                selectedFilter === filter
                                  ? VODACOM.light
                                  : colors.textSecondary,
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {` (${count})`}
                        </ThemedText>
                      )}
                    </ThemedText>
                  </Pressable>
                );
              })}
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
                Completed
              </ThemedText>
              <ThemedText
                type="subtitle"
                style={[styles.statValue, { color: VODACOM.green }]}
              >
                {summary.completedCount}
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
                Pending
              </ThemedText>
              <ThemedText
                type="subtitle"
                style={[styles.statValue, { color: VODACOM.gold }]}
              >
                {summary.pendingCount}
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
                Failed
              </ThemedText>
              <ThemedText
                type="subtitle"
                style={[styles.statValue, { color: VODACOM.red }]}
              >
                {summary.failedCount}
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
            {isLoading && transactions.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={VODACOM.red} />
                <ThemedText
                  style={[styles.emptyStateText, { color: colors.text }]}
                >
                  Loading transactions...
                </ThemedText>
              </View>
            ) : transactions.length === 0 ? (
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
              transactions.map((tx, index) => {
                const isExpanded = expandedId === tx.id;
                const statusColor = getStatusColor(tx.status);

                return (
                  <View key={tx.id}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.transactionItem,
                        pressed && styles.pressed,
                        isExpanded && styles.transactionItemExpanded,
                        index < transactions.length - 1 && [
                          styles.transactionBorder,
                          {
                            borderBottomColor: isDark
                              ? colors.surfaceStrong
                              : "#F1F5F9",
                          },
                        ],
                      ]}
                      onPress={() => toggleExpand(tx.id)}
                    >
                      <View style={styles.transactionLeft}>
                        <View
                          style={[
                            styles.transactionIcon,
                            { backgroundColor: `${statusColor}15` },
                          ]}
                        >
                          <AppSymbol
                            name={getStatusIcon(tx.status) as any}
                            size={20}
                            tintColor={statusColor}
                          />
                        </View>
                        <View style={styles.transactionMain}>
                          <ThemedText
                            type="smallBold"
                            style={[
                              styles.customerText,
                              { color: colors.text },
                            ]}
                          >
                            {tx.customerPhone}
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
                              {formatDate(tx.createdAt)}
                            </ThemedText>
                          </View>
                          {tx.device && (
                            <ThemedText
                              type="small"
                              style={[
                                styles.deviceText,
                                { color: colors.textSecondary },
                              ]}
                            >
                              {tx.device.deviceName} • Terminal{" "}
                              {tx.device.terminalId}
                            </ThemedText>
                          )}
                        </View>
                      </View>
                      <View style={styles.transactionRight}>
                        <ThemedText
                          type="subtitle"
                          style={[styles.amountText, { color: colors.text }]}
                        >
                          {formatAmount(tx.amount)}
                        </ThemedText>
                        <View style={styles.statusBadge}>
                          <View
                            style={[
                              styles.statusDot,
                              { backgroundColor: statusColor },
                            ]}
                          />
                          <ThemedText
                            type="small"
                            style={[styles.statusText, { color: statusColor }]}
                          >
                            {formatStatus(tx.status)}
                          </ThemedText>
                        </View>
                        <View style={styles.expandIndicator}>
                          <AppSymbol
                            name={isExpanded ? "chevron.up" : "chevron.down"}
                            size={14}
                            tintColor={colors.textSecondary}
                          />
                        </View>
                      </View>
                    </Pressable>

                    {/* Expanded Details */}
                    {renderExpandedDetails(tx)}
                  </View>
                );
              })
            )}
          </View>

          {/* Load More */}
          {transactions.length > 0 && pagination.hasNext && (
            <Pressable
              onPress={handleLoadMore}
              disabled={isLoading}
              style={[
                styles.loadMoreButton,
                {
                  borderColor: isDark ? colors.surfaceStrong : "#E2E8F0",
                  backgroundColor: colors.surface,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={VODACOM.red} />
              ) : (
                <>
                  <ThemedText
                    style={[styles.loadMoreText, { color: VODACOM.red }]}
                  >
                    Load More
                  </ThemedText>
                  <AppSymbol
                    name={{ ios: "arrow.down.circle", android: "expand_more" }}
                    size={16}
                    tintColor={VODACOM.red}
                  />
                </>
              )}
            </Pressable>
          )}

          {/* Footer Info */}
          {transactions.length > 0 && (
            <View style={styles.footerInfo}>
              <ThemedText
                style={[styles.footerInfoText, { color: colors.textSecondary }]}
              >
                Showing {transactions.length} of {pagination.total} transactions
              </ThemedText>
            </View>
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
    paddingHorizontal: Spacing.four,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
    paddingRight: Spacing.four,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minWidth: 90,
    alignItems: "center",
  },
  filterChipActive: {
    backgroundColor: VODACOM.red,
    borderColor: VODACOM.red,
  },
  filterChipText: {
    fontSize: 14,
  },
  filterChipCount: {
    fontSize: 12,
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
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
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
  transactionItemExpanded: {
    borderBottomWidth: 0,
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
  transactionMain: {
    flex: 1,
  },
  customerText: {
    fontSize: 14,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  referenceText: {
    fontSize: 12,
  },
  deviceText: {
    fontSize: 11,
    marginTop: 1,
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
    gap: 3,
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
  expandIndicator: {
    marginTop: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  // Expanded Details
  expandedContainer: {
    overflow: "hidden",
    borderRadius: 12,
    marginBottom: 8,
  },
  expandedScroll: {
    flex: 1,
  },
  expandedContent: {
    padding: Spacing.three,
    gap: 6,
  },
  expandedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expandedLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  expandedValue: {
    fontSize: 12,
    fontWeight: "500",
    maxWidth: "60%",
  },
  expandedStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 16,
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
  footerInfo: {
    alignItems: "center",
    paddingVertical: Spacing.two,
  },
  footerInfoText: {
    fontSize: 12,
  },
});
