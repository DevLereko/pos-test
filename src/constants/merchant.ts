export const MerchantBrand = {
  appName: "Vodacom Lesotho M-Pesa",
  appShortName: "M-Pesa POS",
  merchantName: "Highveld Butchery",
  merchantGreeting: "Good morning",
  subline: "Business POS",
  heroMessage: "Take your business further with convenience and ease",
  heroBanner: "Introducing the new M-Pesa Business App for Merchants",
} as const;

export const DashboardStats = [
  {
    label: "Today's Sales",
    value: "M 18,420",
    icon: { ios: "chart.bar.fill", android: "trending_up", web: "trending_up" },
  },
  {
    label: "Transactions",
    value: "84",
    icon: {
      ios: "doc.text.fill",
      android: "receipt_long",
      web: "receipt_long",
    },
  },
  {
    label: "Average Ticket",
    value: "M 219",
    icon: { ios: "creditcard.fill", android: "payments", web: "payments" },
  },
] as const;

export const QuickActions = [
  {
    label: "Scan QR",
    icon: { ios: "qrcode", android: "qr_code_scanner", web: "qr_code_scanner" },
  },
  {
    label: "History",
    icon: { ios: "clock.arrow.circlepath", android: "history", web: "history" },
  },
  {
    label: "Print",
    icon: { ios: "printer", android: "print", web: "print" },
  },
  {
    label: "Settings",
    icon: { ios: "gear", android: "settings", web: "settings" },
  },
] as const;

export const RecentTransactions = [
  {
    customer: "266 588 510 15",
    amount: "M 320.00",
    status: "Completed",
  },
  {
    customer: "266 690 204 88",
    amount: "M 48.00",
    status: "Completed",
  },
  {
    customer: "266 704 819 21",
    amount: "M 126.50",
    status: "Pending",
  },
] as const;

export function transactionStatusTone(status: string) {
  if (status === "Completed") return "success" as const;
  if (status === "Pending") return "warning" as const;
  return "danger" as const;
}

export function withAlpha(hex: string, alphaHex: string) {
  return `${hex}${alphaHex}`;
}
