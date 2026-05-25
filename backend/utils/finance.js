const calculateCharges = (grossAmount) => {
  const brokerage = Math.min(grossAmount * 0.001, 40);
  const taxes = grossAmount * 0.00018;
  return Number((brokerage + taxes).toFixed(2));
};

const calculateHoldingMetrics = (holding) => {
  const invested = holding.quantity * holding.averagePrice;
  const currentValue = holding.quantity * holding.lastPriceSnapshot;
  const pnl = currentValue - invested;
  const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

  return {
    invested: Number(invested.toFixed(2)),
    currentValue: Number(currentValue.toFixed(2)),
    pnl: Number(pnl.toFixed(2)),
    pnlPercent: Number(pnlPercent.toFixed(2)),
  };
};

module.exports = { calculateCharges, calculateHoldingMetrics };
