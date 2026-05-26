const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

const financeTypes = ['income', 'expense', 'investment', 'savings'];
const stockTypes = ['stock_buy', 'stock_sell', 'buy', 'sell'];
const transactionTypes = [...financeTypes, 'stock_buy', 'stock_sell'];
const dataDirectory = path.join(__dirname, '..', 'data');
const transactionsFilePath = path.join(dataDirectory, 'transactions.json');

const round = (value, digits = 2) => Number((Number(value) || 0).toFixed(digits));
const useMockDatabase = () => process.env.NODE_ENV !== 'production' && mongoose.connection.readyState !== 1;
const readJson = (fileName) => JSON.parse(fs.readFileSync(path.join(dataDirectory, fileName), 'utf8'));
const writeTransactions = (transactions) => fs.writeFileSync(transactionsFilePath, `${JSON.stringify(transactions, null, 2)}\n`);
const toPlainObject = (item) => (typeof item.toObject === 'function' ? item.toObject() : item);
const getMockTransactions = () =>
  readJson('transactions.json').map((transaction, index) => {
    const transactionDate = getTransactionDate(transaction.transactionDate || transaction.createdAt);
    const type = normalizeType(transaction.type);

    return {
      _id: transaction._id || transaction.id || `mock_txn_${index + 1}`,
      id: transaction.id || transaction._id || `mock_txn_${index + 1}`,
      category: transaction.category || (stockTypes.includes(type) ? 'Virtual Trading' : 'General'),
      title: transaction.title || transaction.name || transaction.symbol || type.replace('_', ' '),
      amount: round(transaction.amount ?? transaction.netAmount ?? transaction.grossAmount ?? 0),
      paymentMethod: transaction.paymentMethod || 'virtual_wallet',
      notes: transaction.notes || '',
      transactionDate: transactionDate.toISOString(),
      month: transaction.month || transactionDate.getMonth() + 1,
      year: transaction.year || transactionDate.getFullYear(),
      updatedAt: transaction.updatedAt || transaction.createdAt,
      ...transaction,
      type,
    };
  });

const getTransactionDate = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const normalizeType = (type) => {
  if (type === 'buy') return 'stock_buy';
  if (type === 'sell') return 'stock_sell';
  return type;
};

const buildTransactionPayload = (userId, input) => {
  const type = normalizeType(input.type);
  const transactionDate = getTransactionDate(input.transactionDate);
  const stockSymbol = String(input.stockSymbol || input.symbol || '').trim().toUpperCase();
  const stockName = String(input.stockName || input.name || stockSymbol || '').trim();
  const quantity = Number(input.quantity || 0);
  const price = Number(input.price || 0);
  const totalValue = round(input.totalValue ?? input.grossAmount ?? quantity * price);
  const fees = round(input.fees ?? input.charges ?? 0);
  const amount = round(input.amount ?? input.netAmount ?? totalValue + fees);

  return {
    user: userId,
    type,
    category: String(input.category || (stockTypes.includes(type) ? 'Virtual Trading' : 'General')).trim(),
    title: String(input.title || stockName || type.replace('_', ' ')).trim(),
    amount,
    assetType: input.assetType || (stockTypes.includes(type) ? 'stock' : 'cash'),
    symbol: stockSymbol,
    stockSymbol,
    name: stockName,
    stockName,
    quantity,
    price,
    grossAmount: totalValue,
    totalValue,
    charges: fees,
    fees,
    netAmount: amount,
    profitLoss: round(input.profitLoss || 0),
    paymentMethod: String(input.paymentMethod || 'virtual_wallet').trim(),
    notes: String(input.notes || '').trim(),
    transactionDate,
    month: transactionDate.getMonth() + 1,
    year: transactionDate.getFullYear(),
    status: input.status || 'completed',
    rejectionReason: input.rejectionReason || '',
  };
};

const createTransaction = async (userId, input) => {
  const payload = buildTransactionPayload(userId, input);

  if (useMockDatabase()) {
    const now = new Date().toISOString();
    const id = `txn_local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const transaction = {
      ...payload,
      _id: id,
      id,
      user: userId,
      transactionDate: payload.transactionDate.toISOString(),
      createdAt: now,
      updatedAt: now,
    };
    const transactions = readJson('transactions.json');
    transactions.unshift(transaction);
    writeTransactions(transactions);
    return transaction;
  }

  return Transaction.create(payload);
};

const buildListFilter = (userId, query = {}) => {
  const filter = { user: userId };

  if (query.type && query.type !== 'all') {
    filter.type = normalizeType(query.type);
  }

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  if (query.category && query.category !== 'all') {
    filter.category = query.category;
  }

  if (query.month) {
    filter.month = Number(query.month);
  }

  if (query.year) {
    filter.year = Number(query.year);
  }

  if (query.search) {
    const search = String(query.search).trim();
    filter.$or = [
      { title: new RegExp(search, 'i') },
      { category: new RegExp(search, 'i') },
      { stockSymbol: new RegExp(search, 'i') },
      { stockName: new RegExp(search, 'i') },
      { paymentMethod: new RegExp(search, 'i') },
    ];
  }

  return filter;
};

const listTransactions = async (userId, query = {}) => {
  if (useMockDatabase()) {
    const limit = Math.min(Number(query.limit) || 200, 500);
    return getMockTransactions().slice(0, limit);
  }

  const filter = buildListFilter(userId, query);
  const limit = Math.min(Number(query.limit) || 200, 500);

  return Transaction.find(filter).sort({ transactionDate: -1, createdAt: -1 }).limit(limit);
};

const getTransactionById = async (userId, transactionId) => {
  if (useMockDatabase()) {
    return getMockTransactions().find((transaction) => transaction._id === transactionId || transaction.id === transactionId) || null;
  }

  return Transaction.findOne({ _id: transactionId, user: userId });
};

const updateTransaction = async (userId, transactionId, input) => {
  const existing = await getTransactionById(userId, transactionId);

  if (!existing) {
    return null;
  }

  if (useMockDatabase()) {
    const transactions = getMockTransactions();
    const index = transactions.findIndex((transaction) => transaction._id === transactionId || transaction.id === transactionId);
    const payload = buildTransactionPayload(userId, { ...existing, ...input });
    const updated = {
      ...transactions[index],
      ...payload,
      transactionDate: payload.transactionDate.toISOString(),
      updatedAt: new Date().toISOString(),
    };
    transactions[index] = updated;
    writeTransactions(transactions);
    return updated;
  }

  const payload = buildTransactionPayload(userId, { ...existing.toObject(), ...input });
  Object.assign(existing, payload);
  return existing.save();
};

const deleteTransaction = async (userId, transactionId) => {
  if (useMockDatabase()) {
    const transactions = getMockTransactions();
    const transaction = transactions.find((item) => item._id === transactionId || item.id === transactionId);

    if (!transaction) {
      return null;
    }

    writeTransactions(transactions.filter((item) => item._id !== transaction._id && item.id !== transaction.id));
    return transaction;
  }

  return Transaction.findOneAndDelete({ _id: transactionId, user: userId });
};

const summarizeTransactions = (transactions) => {
  const completed = transactions.filter((item) => item.status === 'completed');
  const totals = completed.reduce(
    (acc, item) => {
      const amount = Number(item.amount || item.netAmount || 0);
      const type = normalizeType(item.type);

      if (type === 'income') acc.income += amount;
      if (type === 'expense') acc.expense += amount;
      if (type === 'investment' || type === 'stock_buy') acc.investment += amount;
      if (type === 'savings') acc.savings += amount;
      if (type === 'stock_sell') acc.stockSell += amount;

      acc.totalTransactions += 1;
      return acc;
    },
    { income: 0, expense: 0, investment: 0, savings: 0, stockSell: 0, totalTransactions: 0 }
  );

  const netCashFlow = totals.income + totals.stockSell - totals.expense - totals.investment - totals.savings;
  const savingRate = totals.income > 0 ? ((totals.savings + Math.max(netCashFlow, 0)) / totals.income) * 100 : 0;
  const investmentRate = totals.income > 0 ? (totals.investment / totals.income) * 100 : 0;

  return {
    income: round(totals.income),
    expense: round(totals.expense),
    investment: round(totals.investment),
    savings: round(totals.savings),
    stockSell: round(totals.stockSell),
    netCashFlow: round(netCashFlow),
    savingRate: round(savingRate),
    investmentRate: round(investmentRate),
    totalTransactions: totals.totalTransactions,
  };
};

const groupByCategory = (transactions) => {
  const buckets = new Map();

  transactions
    .filter((item) => item.status === 'completed')
    .forEach((item) => {
      const key = item.category || 'General';
      buckets.set(key, round((buckets.get(key) || 0) + Number(item.amount || item.netAmount || 0)));
    });

  return Array.from(buckets.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

const groupMonthly = (transactions) => {
  const buckets = new Map();

  transactions.forEach((item) => {
    const month = item.month || new Date(item.transactionDate || item.createdAt).getMonth() + 1;
    const year = item.year || new Date(item.transactionDate || item.createdAt).getFullYear();
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const current =
      buckets.get(key) ||
      {
        key,
        month,
        year,
        income: 0,
        expense: 0,
        investment: 0,
        savings: 0,
        stockBuy: 0,
        stockSell: 0,
        netCashFlow: 0,
        transactionCount: 0,
      };
    const amount = Number(item.amount || item.netAmount || 0);
    const type = normalizeType(item.type);

    if (item.status === 'completed') {
      if (type === 'income') current.income += amount;
      if (type === 'expense') current.expense += amount;
      if (type === 'investment') current.investment += amount;
      if (type === 'savings') current.savings += amount;
      if (type === 'stock_buy') current.stockBuy += amount;
      if (type === 'stock_sell') current.stockSell += amount;
    }

    current.transactionCount += 1;
    current.netCashFlow = current.income + current.stockSell - current.expense - current.investment - current.savings - current.stockBuy;
    buckets.set(key, current);
  });

  return Array.from(buckets.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ key, ...item }) => ({
      ...item,
      income: round(item.income),
      expense: round(item.expense),
      investment: round(item.investment),
      savings: round(item.savings),
      stockBuy: round(item.stockBuy),
      stockSell: round(item.stockSell),
      netCashFlow: round(item.netCashFlow),
    }));
};

const buildInsights = ({ currentSummary, previousSummary, categoryBreakdown, portfolioAnalytics }) => {
  const insights = [];
  const food = categoryBreakdown.find((item) => /food|dining|restaurant/i.test(item.category));
  const topCategory = categoryBreakdown[0];
  const income = currentSummary.income || 0;
  const healthBase = 55 + Math.min(currentSummary.savingRate, 25) + Math.min(currentSummary.investmentRate, 20);
  const moneyHealthScore = Math.max(0, Math.min(100, round(healthBase - (currentSummary.expense > income * 0.75 && income > 0 ? 15 : 0), 0)));

  if (food && previousSummary.expense > 0) {
    const change = ((food.amount - previousSummary.expense * 0.18) / Math.max(previousSummary.expense * 0.18, 1)) * 100;
    if (change > 10) {
      insights.push(`Your food spending increased by ${round(change, 0)}% compared with your usual monthly mix.`);
    }
  }

  if (income > 0) {
    insights.push(`You invested ${round(currentSummary.investmentRate, 0)}% of your income this month.`);
  }

  if (currentSummary.savings > previousSummary.savings) {
    insights.push(`You saved ${round(currentSummary.savings - previousSummary.savings, 0)} more than last month.`);
  }

  if (portfolioAnalytics?.sectorExposure?.[0]?.value > 45) {
    insights.push(`Your portfolio has high exposure to ${portfolioAnalytics.sectorExposure[0].label}.`);
  }

  if (topCategory && topCategory.amount > income * 0.35 && income > 0) {
    insights.push(`${topCategory.category} is your largest spending category at ${round((topCategory.amount / income) * 100, 0)}% of income.`);
  }

  return {
    moneyHealthScore,
    spendingPatternSummary:
      topCategory && currentSummary.expense > 0
        ? `${topCategory.category} leads spending this month, with total expenses at ${round(currentSummary.expense)}.`
        : 'Your finance ledger is clean and ready for this month of tracking.',
    overspendingDetection:
      currentSummary.expense > income * 0.75 && income > 0
        ? 'Expenses are above 75% of income this month. Slow discretionary categories before adding new risk.'
        : 'No major overspending pattern detected from completed transactions.',
    savingSuggestions:
      currentSummary.savingRate < 20
        ? ['Route at least 20% of income into savings before discretionary spends.', 'Create separate categories for fixed and variable expenses.']
        : ['Savings rate is healthy. Keep surplus in short-term instruments before deploying into risk assets.'],
    investmentSuggestions:
      currentSummary.investmentRate < 15
        ? ['Increase monthly investment allocation gradually once emergency savings are stable.']
        : ['Investment allocation is strong. Review concentration and rebalance across sectors.'],
    riskAlert:
      portfolioAnalytics?.summary?.riskScore >= 70
        ? 'Portfolio risk score is elevated. Recheck position sizing before adding more exposure.'
        : 'Portfolio risk is within the configured profile.',
    stockPortfolioInsight:
      portfolioAnalytics?.summary
        ? `Unrealized P/L is ${round(portfolioAnalytics.summary.unrealizedPnL || 0)} with wallet balance ${round(portfolioAnalytics.summary.cashBalance || 0)}.`
        : 'Stock portfolio insight will appear after virtual trades are available.',
    highlights: insights,
  };
};

const getSummary = async (userId, query = {}) => {
  const date = new Date();
  const month = Number(query.month) || date.getMonth() + 1;
  const year = Number(query.year) || date.getFullYear();
  const transactions = await listTransactions(userId, { ...query, month, year, limit: 500 });
  return summarizeTransactions(transactions);
};

const getMonthly = async (userId, query = {}) => {
  const transactions = await listTransactions(userId, { ...query, limit: 500 });
  return groupMonthly(transactions);
};

const getAnalytics = async (userId, query = {}, portfolioAnalytics = null) => {
  const allTransactions = await listTransactions(userId, { ...query, limit: 500 });
  const monthly = groupMonthly(allTransactions);
  const now = new Date();
  const month = Number(query.month) || now.getMonth() + 1;
  const year = Number(query.year) || now.getFullYear();
  const previousDate = new Date(year, month - 2, 1);
  const currentTransactions = allTransactions.filter((item) => item.month === month && item.year === year);
  const previousTransactions = allTransactions.filter(
    (item) => item.month === previousDate.getMonth() + 1 && item.year === previousDate.getFullYear()
  );
  const currentSummary = summarizeTransactions(currentTransactions);
  const previousSummary = summarizeTransactions(previousTransactions);
  const categoryBreakdown = groupByCategory(currentTransactions.filter((item) => normalizeType(item.type) === 'expense'));
  const paymentMethods = groupByCategory(currentTransactions.map((item) => ({ ...toPlainObject(item), category: item.paymentMethod || 'Other' })));

  return {
    summary: currentSummary,
    previousSummary,
    monthly,
    categoryBreakdown,
    paymentMethods,
    cashFlow: monthly.map((item) => ({
      month: `${item.year}-${String(item.month).padStart(2, '0')}`,
      income: item.income,
      expense: item.expense,
      investment: item.investment + item.stockBuy,
      savings: item.savings,
      netCashFlow: item.netCashFlow,
    })),
    stockProfitLoss: {
      realized: round(
        allTransactions
          .filter((item) => normalizeType(item.type) === 'stock_sell' && item.status === 'completed')
          .reduce((sum, item) => sum + Number(item.profitLoss || 0), 0)
      ),
      unrealized: round(portfolioAnalytics?.summary?.unrealizedPnL || 0),
      total: round((portfolioAnalytics?.summary?.unrealizedPnL || 0) + (portfolioAnalytics?.summary?.realizedPnL || 0)),
    },
    aiInsights: buildInsights({ currentSummary, previousSummary, categoryBreakdown, portfolioAnalytics }),
  };
};

module.exports = {
  transactionTypes,
  createTransaction,
  listTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getMonthly,
  getAnalytics,
  summarizeTransactions,
};
