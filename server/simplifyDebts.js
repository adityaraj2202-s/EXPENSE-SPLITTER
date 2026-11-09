/**
 * Minimizes the number of peer-to-peer settlement transactions
 * using a greedy two-pointer strategy.
 *
 * @param {Array<{userId: number, name: string, netBalance: number}>} balances
 * @returns {Array<{fromUserId: number, fromName: string, toUserId: number, toName: string, amount: number}>}
 */
export function simplifyDebts(balances) {
  // Separate into debtors (owe money) and creditors (owed money)
  const debtors = [];
  const creditors = [];

  for (const b of balances) {
    const net = Math.round(b.netBalance * 100) / 100;
    if (net < -0.009) {
      debtors.push({ userId: b.userId, name: b.name, amount: Math.abs(net) });
    } else if (net > 0.009) {
      creditors.push({ userId: b.userId, name: b.name, amount: net });
    }
  }

  // Sort descending by amount to resolve largest imbalances first
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];

    const settledAmount = Math.min(debtor.amount, creditor.amount);
    const roundedAmount = Math.round(settledAmount * 100) / 100;

    if (roundedAmount > 0) {
      transactions.push({
        fromUserId: debtor.userId,
        fromName: debtor.name,
        toUserId: creditor.userId,
        toName: creditor.name,
        amount: roundedAmount
      });
    }

    debtor.amount = Math.round((debtor.amount - settledAmount) * 100) / 100;
    creditor.amount = Math.round((creditor.amount - settledAmount) * 100) / 100;

    if (debtor.amount <= 0.009) d++;
    if (creditor.amount <= 0.009) c++;
  }

  return transactions;
}