import { SymbolView, type SymbolViewProps } from "expo-symbols";

type AppSymbolName =
  | string
  | {
      ios?: string;
      android?: string;
      web?: string;
    };

type AppSymbolProps = {
  name: AppSymbolName;
  size?: number;
  tintColor?: string;
  style?: SymbolViewProps["style"];
} & Omit<SymbolViewProps, "name" | "size" | "tintColor" | "style">;

const IOS_TO_MATERIAL: Record<string, string> = {
  "arrow.counterclockwise": "refresh",
  "arrow.down.circle": "arrow_downward",
  "arrow.right.circle.fill": "arrow_forward",
  "bell.fill": "notifications",
  "chart.bar.fill": "trending_up",
  "checkmark.circle.fill": "check_circle",
  "checkmark.seal.fill": "verified",
  "chevron.right": "chevron_right",
  "circle.fill": "radio_button_checked",
  "clock.arrow.circlepath": "history",
  "clock.badge.exclamationmark": "hourglass_top",
  "clock.circle.fill": "history_toggle_off",
  "clock.fill": "schedule",
  "creditcard.circle.fill": "account_balance_wallet",
  "creditcard.fill": "payments",
  "doc.text.fill": "receipt_long",
  "doc.text.magnifyingglass": "manage_search",
  "exclamationmark.circle.fill": "error",
  gear: "settings",
  "gear.circle.fill": "settings",
  iphone: "phone_android",
  "iphone.gen1": "phone_android",
  "lock.fill": "lock",
  magnifyingglass: "search",
  "megaphone.fill": "campaign",
  "message.fill": "message",
  "person.circle.fill": "account_circle",
  "person.fill": "person",
  printer: "print",
  "printer.fill": "print",
  qrcode: "qr_code_scanner",
  "rectangle.portrait.and.arrow.right": "logout",
  "slider.horizontal.3": "tune",
  "square.grid.2x2.circle.fill": "dashboard",
  "square.grid.2x2.fill": "apps",
  "xmark.circle.fill": "cancel",
};

const MATERIAL_ALIASES: Record<string, string> = {
  announcement: "campaign",
  close: "cancel",
  hourglass: "hourglass_top",
};

function normalizeMaterialSymbol(symbol?: string) {
  if (!symbol) return undefined;
  return MATERIAL_ALIASES[symbol] || symbol;
}

function toMaterialSymbol(symbol?: string) {
  if (!symbol) return "star";
  return normalizeMaterialSymbol(IOS_TO_MATERIAL[symbol] || symbol) || "star";
}

function resolveSymbolName(name: AppSymbolName): SymbolViewProps["name"] {
  if (typeof name === "string") {
    return {
      ios: name as any,
      android: toMaterialSymbol(name) as any,
      web: toMaterialSymbol(name) as any,
    };
  }

  const ios = name.ios;
  const explicitAndroid = normalizeMaterialSymbol(name.android);
  const explicitWeb = normalizeMaterialSymbol(name.web);

  const android =
    explicitAndroid && explicitAndroid !== "star"
      ? explicitAndroid
      : explicitWeb && explicitWeb !== "star"
        ? explicitWeb
        : toMaterialSymbol(ios);
  const web =
    explicitWeb && explicitWeb !== "star"
      ? explicitWeb
      : explicitAndroid && explicitAndroid !== "star"
        ? explicitAndroid
        : toMaterialSymbol(ios);

  return {
    ios: (ios || "questionmark.circle") as any,
    android: android as any,
    web: web as any,
  };
}

export function AppSymbol({
  name,
  size,
  tintColor,
  style,
  ...props
}: AppSymbolProps) {
  return (
    <SymbolView
      {...props}
      name={resolveSymbolName(name)}
      size={size}
      tintColor={tintColor}
      style={style}
    />
  );
}
