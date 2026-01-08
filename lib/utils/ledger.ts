// Ledger calculation utilities

export interface LedgerEntry {
  type: 'invoice' | 'payment';
  amount: number;
  date: string;
  balance: number;
}

export interface LedgerResult {
  entries: LedgerEntry[];
  openingBalance: number;
  closingBalance: number;
}

export function calculateLedgerBalance(
  entries: Array<{ type: 'invoice' | 'payment'; amount: number; date: string }>
): LedgerResult {
  let balance = 0;
  const ledgerEntries = entries.map((entry) => {
    if (entry.type === 'invoice') {
      balance += entry.amount;
    } else {
      balance -= entry.amount;
    }
    return {
      ...entry,
      balance,
    };
  });

  return {
    entries: ledgerEntries,
    openingBalance: 0,
    closingBalance: balance,
  };
}

