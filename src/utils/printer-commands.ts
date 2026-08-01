const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;
const FF = 0x0c;
const CR = 0x0d;
const DLE = 0x10;
const EOT = 0x04;
const STX = 0x02;
const ETX = 0x03;

export function initializePrinter(): number[] {
  return [ESC, 0x40];
}

export function printText(text: string): number[] {
  const textBytes = Array.from(new TextEncoder().encode(text));
  return [...textBytes, LF];
}

export function feedLines(lines: number): number[] {
  return [ESC, 0x64, lines];
}

export function cutPaper(mode: number = 0): number[] {
  return [GS, 0x56, mode];
}

export function buildTestReceipt(
  merchantName: string,
  userName: string,
  terminalId: string,
): number[] {
  const now = new Date();
  const commands = [
    initializePrinter(),
    printText("================================"),
    printText("        M-PESA POS"),
    printText("        Vodacom Lesotho"),
    printText("================================"),
    printText(""),
    printText("     TEST RECEIPT"),
    printText(""),
    printText("Merchant: " + merchantName),
    printText("Terminal: " + terminalId),
    printText("Operator: " + userName),
    printText(""),
    printText("Date: " + now.toLocaleDateString()),
    printText("Time: " + now.toLocaleTimeString()),
    printText(""),
    printText("-------------------------------"),
    printText("Item          Qty    Price"),
    printText("-------------------------------"),
    printText("Test Item     1      M 10.00"),
    printText("Sample Item   2      M 25.00"),
    printText("-------------------------------"),
    printText("Subtotal:            M 35.00"),
    printText("Tax (15%):           M 5.25"),
    printText("TOTAL:               M 40.25"),
    printText(""),
    printText("-------------------------------"),
    printText("Payment:             M 40.25"),
    printText("Change:              M 0.00"),
    printText(""),
    printText("        *** APPROVED ***"),
    printText(""),
    printText("================================"),
    printText("Thank you for using M-Pesa"),
    printText("================================"),
    printText(""),
    feedLines(3),
    cutPaper(0),
  ];
  return commands.flat();
}

export function chunkData(data: number[], chunkSize: number = 20): number[][] {
  const chunks: number[][] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}
