/**
 * Prisma Seed Script for TradeLog
 *
 * Populates the database with sample data for development and testing:
 * - 2 groups (SPY Calendar Spread, AAPL Ratio Calendar)
 * - 6 trades (3 in Group 1, 2 in Group 2, 1 ungrouped)
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { addDays } from 'date-fns';
import 'dotenv/config';

// Prisma 7 requires a database adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed(): Promise<void> {
  console.log('🌱 Starting database seed...');

  // Calculate dates relative to today using date-fns
  const today = new Date();
  const in10Days = addDays(today, 10);
  const in15Days = addDays(today, 15);
  const in30Days = addDays(today, 30);
  const in45Days = addDays(today, 45);
  const in60Days = addDays(today, 60);

  // Clean existing data (for idempotency)
  console.log('🧹 Cleaning existing data...');
  await prisma.trade.deleteMany();
  await prisma.group.deleteMany();
  console.log('✓ Existing data cleaned');

  // Create Group 1: SPY Calendar Spread
  console.log('📦 Creating Group 1: SPY Calendar Spread...');
  const group1 = await prisma.group.create({
    data: {
      name: 'SPY Calendar Spread',
      strategyType: 'CALENDAR_SPREAD',
      notes: 'Calendar spread on SPY targeting 30/60 day expiration differential',
    },
  });
  console.log(`✓ Created group: ${group1.name} (${group1.uuid})`);

  // Create trades for Group 1
  console.log('📈 Creating trades for Group 1...');
  await prisma.trade.create({
    data: {
      symbol: 'SPY',
      strikePrice: 450,
      expiryDate: in30Days,
      tradeType: 'BUY',
      optionType: 'CALL',
      quantity: 1,
      costBasis: 500,
      currentValue: 520,
      notes: 'Long call - near term',
      groupUuid: group1.uuid,
    },
  });
  console.log(`  ✓ Trade 1: SPY $450 CALL (BUY)`);

  await prisma.trade.create({
    data: {
      symbol: 'SPY',
      strikePrice: 450,
      expiryDate: in60Days,
      tradeType: 'SELL',
      optionType: 'CALL',
      quantity: 1,
      costBasis: -300,
      currentValue: -280,
      notes: 'Short call - far term',
      groupUuid: group1.uuid,
    },
  });
  console.log(`  ✓ Trade 2: SPY $450 CALL (SELL)`);

  await prisma.trade.create({
    data: {
      symbol: 'SPY',
      strikePrice: 455,
      expiryDate: in30Days,
      tradeType: 'BUY',
      optionType: 'CALL',
      quantity: 1,
      costBasis: 450,
      currentValue: 470,
      notes: 'Long call - near term (higher strike)',
      groupUuid: group1.uuid,
    },
  });
  console.log(`  ✓ Trade 3: SPY $455 CALL (BUY)`);

  // Create Group 2: AAPL Ratio Calendar
  console.log('📦 Creating Group 2: AAPL Ratio Calendar...');
  const group2 = await prisma.group.create({
    data: {
      name: 'AAPL Ratio Calendar',
      strategyType: 'RATIO_CALENDAR_SPREAD',
      notes: '2:1 ratio calendar on AAPL puts',
    },
  });
  console.log(`✓ Created group: ${group2.name} (${group2.uuid})`);

  // Create trades for Group 2
  console.log('📈 Creating trades for Group 2...');
  await prisma.trade.create({
    data: {
      symbol: 'AAPL',
      strikePrice: 180,
      expiryDate: in15Days,
      tradeType: 'BUY',
      optionType: 'PUT',
      quantity: 2,
      costBasis: 800,
      currentValue: 820,
      notes: 'Long puts - 2 contracts',
      groupUuid: group2.uuid,
    },
  });
  console.log(`  ✓ Trade 4: AAPL $180 PUT (BUY) x2`);

  await prisma.trade.create({
    data: {
      symbol: 'AAPL',
      strikePrice: 180,
      expiryDate: in45Days,
      tradeType: 'SELL',
      optionType: 'PUT',
      quantity: 1,
      costBasis: -450,
      currentValue: -430,
      notes: 'Short put - 1 contract',
      groupUuid: group2.uuid,
    },
  });
  console.log(`  ✓ Trade 5: AAPL $180 PUT (SELL) x1`);

  // Create ungrouped trade
  console.log('📈 Creating ungrouped trade...');
  await prisma.trade.create({
    data: {
      symbol: 'TSLA',
      strikePrice: 250,
      expiryDate: in10Days,
      tradeType: 'BUY',
      optionType: 'CALL',
      quantity: 1,
      costBasis: 600,
      currentValue: 550,
      notes: 'Standalone TSLA call - ungrouped',
      groupUuid: null,
    },
  });
  console.log(`  ✓ Ungrouped Trade: TSLA $250 CALL (BUY)`);

  // Summary
  console.log('\n✅ Seed completed successfully!');
  console.log(`   📊 Created 2 groups`);
  console.log(`   📈 Created 6 trades (3 in Group 1, 2 in Group 2, 1 ungrouped)`);
  console.log(`\n   Groups:`);
  console.log(`   - ${group1.name} (${group1.strategyType}): 3 trades`);
  console.log(`   - ${group2.name} (${group2.strategyType}): 2 trades`);
  console.log(`   - Ungrouped: 1 trade\n`);
}

// Run seed
seed()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🏁 Seed script completed');
  });
