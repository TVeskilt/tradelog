/**
 * Database Seed Script
 *
 * This script will populate the database with sample development data:
 * - 2 sample groups (Calendar Spread, Ratio Calendar Spread)
 * - 6 sample trades (3 per group)
 * - Realistic options data (SPY, QQQ symbols)
 *
 * NOTE: This will be fully implemented in STORY-003 after Prisma is set up.
 * For now, this is a placeholder structure.
 */

async function seed() {
  console.log('🌱 Starting database seed...');

  // Sample data structure (will use Prisma after STORY-003)
  const sampleGroups = [
    {
      name: 'SPY Calendar Spread',
      strategyType: 'CALENDAR_SPREAD',
      notes: 'Long-term bullish position on SPY',
    },
    {
      name: 'QQQ Ratio Calendar Spread',
      strategyType: 'RATIO_CALENDAR_SPREAD',
      notes: 'Tech sector exposure with ratio spread',
    },
  ];

  const sampleTrades = [
    // Group 1: SPY Calendar Spread
    {
      symbol: 'SPY',
      strikePrice: 450,
      expiryDate: '2026-03-20',
      tradeType: 'BUY',
      optionType: 'CALL',
      quantity: 10,
      costBasis: 5.50,
      currentValue: 6.20,
      status: 'OPEN',
      notes: 'Long call - front month',
    },
    {
      symbol: 'SPY',
      strikePrice: 450,
      expiryDate: '2026-06-19',
      tradeType: 'SELL',
      optionType: 'CALL',
      quantity: 10,
      costBasis: 8.30,
      currentValue: 8.10,
      status: 'OPEN',
      notes: 'Short call - back month',
    },
    {
      symbol: 'SPY',
      strikePrice: 455,
      expiryDate: '2026-03-20',
      tradeType: 'BUY',
      optionType: 'PUT',
      quantity: 5,
      costBasis: 4.20,
      currentValue: 3.80,
      status: 'OPEN',
      notes: 'Protective put',
    },
    // Group 2: QQQ Ratio Calendar Spread
    {
      symbol: 'QQQ',
      strikePrice: 380,
      expiryDate: '2026-04-17',
      tradeType: 'BUY',
      optionType: 'CALL',
      quantity: 20,
      costBasis: 6.75,
      currentValue: 7.10,
      status: 'OPEN',
      notes: 'Long call - near term',
    },
    {
      symbol: 'QQQ',
      strikePrice: 380,
      expiryDate: '2026-07-17',
      tradeType: 'SELL',
      optionType: 'CALL',
      quantity: 10,
      costBasis: 10.20,
      currentValue: 9.90,
      status: 'OPEN',
      notes: 'Short call - far term (ratio 2:1)',
    },
    {
      symbol: 'QQQ',
      strikePrice: 375,
      expiryDate: '2026-04-17',
      tradeType: 'BUY',
      optionType: 'PUT',
      quantity: 10,
      costBasis: 5.30,
      currentValue: 4.90,
      status: 'OPEN',
      notes: 'Downside protection',
    },
  ];

  console.log('\n📊 Sample Groups:');
  sampleGroups.forEach((group, index) => {
    console.log(`  ${index + 1}. ${group.name} (${group.strategyType})`);
  });

  console.log('\n💼 Sample Trades:');
  sampleTrades.forEach((trade, index) => {
    const pnl = ((trade.currentValue - trade.costBasis) * trade.quantity).toFixed(2);
    console.log(
      `  ${index + 1}. ${trade.symbol} ${trade.strikePrice} ${trade.optionType} ${trade.expiryDate} (P&L: $${pnl})`
    );
  });

  console.log('\n⚠️  NOTE: Database insertion will be implemented in STORY-003 (Prisma ORM Setup)');
  console.log('✅ Seed script structure validated!\n');
}

// Run seed
seed()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('🏁 Seed script completed');
  });
