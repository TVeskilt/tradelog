import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TradeType, OptionType, TradeStatus } from '@prisma/client';

describe('Trades API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same global pipes and interceptors as main app
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    );

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector), {
        excludeExtraneousValues: true,
      }),
    );

    // Enable versioning
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.trade.deleteMany();
    await prisma.group.deleteMany();
  });

  describe('POST /v1/trades', () => {
    it('should create a new trade successfully', async () => {
      const createTradeDto = {
        symbol: 'AAPL',
        strikePrice: 150.0,
        expiryDate: '2026-02-15T00:00:00.000Z',
        tradeType: TradeType.BUY,
        optionType: OptionType.CALL,
        quantity: 10,
        costBasis: 1500.0,
        currentValue: 1750.0,
        notes: 'Long call position on AAPL',
      };

      const response = await request(app.getHttpServer()).post('/v1/trades').send(createTradeDto).expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject({
        symbol: 'AAPL',
        strikePrice: 150.0,
        tradeType: TradeType.BUY,
        optionType: OptionType.CALL,
        quantity: 10,
        costBasis: 1500.0,
        currentValue: 1750.0,
        status: TradeStatus.OPEN,
        notes: 'Long call position on AAPL',
      });

      expect(response.body.data).toHaveProperty('uuid');
      expect(response.body.data).toHaveProperty('pnl', 250.0);
      expect(response.body.data).toHaveProperty('daysToExpiry');
      expect(typeof response.body.data.daysToExpiry).toBe('number');

      // Verify createdAt and updatedAt are NOT exposed
      expect(response.body.data).not.toHaveProperty('createdAt');
      expect(response.body.data).not.toHaveProperty('updatedAt');
    });

    it('should default status to OPEN', async () => {
      const createTradeDto = {
        symbol: 'SPY',
        strikePrice: 450.0,
        expiryDate: '2026-03-20T00:00:00.000Z',
        tradeType: TradeType.SELL,
        optionType: OptionType.PUT,
        quantity: 5,
        costBasis: 2000.0,
        currentValue: 1800.0,
      };

      const response = await request(app.getHttpServer()).post('/v1/trades').send(createTradeDto).expect(201);

      expect(response.body.data.status).toBe(TradeStatus.OPEN);
    });

    it('should create trade with optional groupUuid', async () => {
      // First create a group
      const group = await prisma.group.create({
        data: {
          name: 'Test Group',
          strategyType: 'CALENDAR_SPREAD',
        },
      });

      const createTradeDto = {
        symbol: 'TSLA',
        strikePrice: 250.0,
        expiryDate: '2026-04-15T00:00:00.000Z',
        tradeType: TradeType.BUY,
        optionType: OptionType.CALL,
        quantity: 1,
        costBasis: 600.0,
        currentValue: 550.0,
        groupUuid: group.uuid,
      };

      const response = await request(app.getHttpServer()).post('/v1/trades').send(createTradeDto).expect(201);

      expect(response.body.data.groupUuid).toBe(group.uuid);
    });

    it('should return 400 for invalid validation (missing required fields)', async () => {
      const invalidDto = {
        symbol: 'AAPL',
        // Missing required fields
      };

      await request(app.getHttpServer()).post('/v1/trades').send(invalidDto).expect(400);
    });

    it('should return 400 for invalid enum values', async () => {
      const invalidDto = {
        symbol: 'AAPL',
        strikePrice: 150.0,
        expiryDate: '2026-02-15T00:00:00.000Z',
        tradeType: 'INVALID_TYPE',
        optionType: OptionType.CALL,
        quantity: 10,
        costBasis: 1500.0,
        currentValue: 1750.0,
      };

      await request(app.getHttpServer()).post('/v1/trades').send(invalidDto).expect(400);
    });

    it('should return 400 for negative strikePrice', async () => {
      const invalidDto = {
        symbol: 'AAPL',
        strikePrice: -10.0,
        expiryDate: '2026-02-15T00:00:00.000Z',
        tradeType: TradeType.BUY,
        optionType: OptionType.CALL,
        quantity: 10,
        costBasis: 1500.0,
        currentValue: 1750.0,
      };

      await request(app.getHttpServer()).post('/v1/trades').send(invalidDto).expect(400);
    });
  });

  describe('GET /v1/trades', () => {
    it('should return empty array when no trades exist', async () => {
      const response = await request(app.getHttpServer()).get('/v1/trades').expect(200);

      expect(response.body).toEqual({ data: [] });
    });

    it('should return all trades with derived fields', async () => {
      // Create multiple trades
      await prisma.trade.createMany({
        data: [
          {
            symbol: 'AAPL',
            strikePrice: 150.0,
            expiryDate: new Date('2026-02-15'),
            tradeType: TradeType.BUY,
            optionType: OptionType.CALL,
            quantity: 10,
            costBasis: 1500.0,
            currentValue: 1750.0,
            status: TradeStatus.OPEN,
          },
          {
            symbol: 'SPY',
            strikePrice: 450.0,
            expiryDate: new Date('2026-03-20'),
            tradeType: TradeType.SELL,
            optionType: OptionType.PUT,
            quantity: 5,
            costBasis: 2000.0,
            currentValue: 1800.0,
            status: TradeStatus.OPEN,
          },
        ],
      });

      const response = await request(app.getHttpServer()).get('/v1/trades').expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('pnl');
      expect(response.body.data[0]).toHaveProperty('daysToExpiry');
      expect(response.body.data[1]).toHaveProperty('pnl');
      expect(response.body.data[1]).toHaveProperty('daysToExpiry');

      // Verify P&L calculations
      expect(response.body.data[0].pnl).toBe(250.0); // 1750 - 1500
      expect(response.body.data[1].pnl).toBe(-200.0); // 1800 - 2000
    });

    it('should not expose createdAt and updatedAt fields', async () => {
      await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 1500.0,
          currentValue: 1750.0,
          status: TradeStatus.OPEN,
        },
      });

      const response = await request(app.getHttpServer()).get('/v1/trades').expect(200);

      expect(response.body.data[0]).not.toHaveProperty('createdAt');
      expect(response.body.data[0]).not.toHaveProperty('updatedAt');
    });
  });

  describe('GET /v1/trades/:uuid', () => {
    it('should return a single trade by UUID', async () => {
      const trade = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 1500.0,
          currentValue: 1750.0,
          status: TradeStatus.OPEN,
        },
      });

      const response = await request(app.getHttpServer()).get(`/v1/trades/${trade.uuid}`).expect(200);

      expect(response.body.data).toMatchObject({
        uuid: trade.uuid,
        symbol: 'AAPL',
        strikePrice: 150.0,
        pnl: 250.0,
      });
    });

    it('should return 404 when trade not found', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app.getHttpServer()).get(`/v1/trades/${fakeUuid}`).expect(404);

      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /v1/trades/:uuid', () => {
    it('should update a trade successfully', async () => {
      const trade = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 1500.0,
          currentValue: 1750.0,
          status: TradeStatus.OPEN,
        },
      });

      const updateDto = {
        currentValue: 1800.0,
        status: TradeStatus.CLOSING_SOON,
      };

      const response = await request(app.getHttpServer()).put(`/v1/trades/${trade.uuid}`).send(updateDto).expect(200);

      expect(response.body.data).toMatchObject({
        uuid: trade.uuid,
        currentValue: 1800.0,
        status: TradeStatus.CLOSING_SOON,
        pnl: 300.0, // Updated P&L: 1800 - 1500
      });
    });

    it('should allow partial updates', async () => {
      const trade = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 1500.0,
          currentValue: 1750.0,
          status: TradeStatus.OPEN,
          notes: 'Original note',
        },
      });

      const updateDto = {
        notes: 'Updated note',
      };

      const response = await request(app.getHttpServer()).put(`/v1/trades/${trade.uuid}`).send(updateDto).expect(200);

      expect(response.body.data.notes).toBe('Updated note');
      expect(response.body.data.symbol).toBe('AAPL'); // Other fields unchanged
    });

    it('should return 404 when updating non-existent trade', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      await request(app.getHttpServer()).put(`/v1/trades/${fakeUuid}`).send({ currentValue: 2000.0 }).expect(404);
    });

    it('should return 400 for invalid update data', async () => {
      const trade = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 1500.0,
          currentValue: 1750.0,
          status: TradeStatus.OPEN,
        },
      });

      await request(app.getHttpServer())
        .put(`/v1/trades/${trade.uuid}`)
        .send({ quantity: -5 }) // Invalid: negative quantity
        .expect(400);
    });
  });

  describe('DELETE /v1/trades/:uuid', () => {
    it('should delete a trade successfully', async () => {
      const trade = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 1500.0,
          currentValue: 1750.0,
          status: TradeStatus.OPEN,
        },
      });

      const response = await request(app.getHttpServer()).delete(`/v1/trades/${trade.uuid}`).expect(200);

      expect(response.body).toEqual({ data: null });

      // Verify trade was deleted
      const deletedTrade = await prisma.trade.findUnique({
        where: { uuid: trade.uuid },
      });
      expect(deletedTrade).toBeNull();
    });

    it('should return 404 when deleting non-existent trade', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      await request(app.getHttpServer()).delete(`/v1/trades/${fakeUuid}`).expect(404);
    });

    it('should handle group integrity check when deleting trade in group', async () => {
      // Create a group
      const group = await prisma.group.create({
        data: {
          name: 'Test Group',
          strategyType: 'CALENDAR_SPREAD',
        },
      });

      // Create 2 trades in the group
      const trade1 = await prisma.trade.create({
        data: {
          symbol: 'SPY',
          strikePrice: 450.0,
          expiryDate: new Date('2026-03-20'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 1,
          costBasis: 500.0,
          currentValue: 520.0,
          status: TradeStatus.OPEN,
          groupUuid: group.uuid,
        },
      });

      const trade2 = await prisma.trade.create({
        data: {
          symbol: 'SPY',
          strikePrice: 450.0,
          expiryDate: new Date('2026-06-19'),
          tradeType: TradeType.SELL,
          optionType: OptionType.CALL,
          quantity: 1,
          costBasis: 300.0,
          currentValue: 280.0,
          status: TradeStatus.OPEN,
          groupUuid: group.uuid,
        },
      });

      // Delete one trade - should trigger group deletion and ungroup remaining trade
      await request(app.getHttpServer()).delete(`/v1/trades/${trade1.uuid}`).expect(200);

      // Verify group was deleted
      const deletedGroup = await prisma.group.findUnique({
        where: { uuid: group.uuid },
      });
      expect(deletedGroup).toBeNull();

      // Verify remaining trade was ungrouped (not deleted!)
      const remainingTrade = await prisma.trade.findUnique({
        where: { uuid: trade2.uuid },
      });
      expect(remainingTrade).not.toBeNull();
      expect(remainingTrade?.groupUuid).toBeNull(); // Should be ungrouped
    });

    it('should delete ungrouped trade without affecting other trades', async () => {
      // Create ungrouped trade
      const trade = await prisma.trade.create({
        data: {
          symbol: 'TSLA',
          strikePrice: 250.0,
          expiryDate: new Date('2026-04-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 1,
          costBasis: 600.0,
          currentValue: 550.0,
          status: TradeStatus.OPEN,
        },
      });

      await request(app.getHttpServer()).delete(`/v1/trades/${trade.uuid}`).expect(200);

      const deletedTrade = await prisma.trade.findUnique({
        where: { uuid: trade.uuid },
      });
      expect(deletedTrade).toBeNull();
    });
  });

  describe('Derived Fields Calculation', () => {
    it('should calculate P&L correctly (positive)', async () => {
      const trade = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 1000.0,
          currentValue: 1500.0,
          status: TradeStatus.OPEN,
        },
      });

      const response = await request(app.getHttpServer()).get(`/v1/trades/${trade.uuid}`).expect(200);

      expect(response.body.data.pnl).toBe(500.0);
    });

    it('should calculate P&L correctly (negative)', async () => {
      const trade = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 2000.0,
          currentValue: 1500.0,
          status: TradeStatus.OPEN,
        },
      });

      const response = await request(app.getHttpServer()).get(`/v1/trades/${trade.uuid}`).expect(200);

      expect(response.body.data.pnl).toBe(-500.0);
    });

    it('should calculate daysToExpiry correctly', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const trade = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: futureDate,
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 1500.0,
          currentValue: 1750.0,
          status: TradeStatus.OPEN,
        },
      });

      const response = await request(app.getHttpServer()).get(`/v1/trades/${trade.uuid}`).expect(200);

      // Should be approximately 30 days (allow for timing differences)
      expect(response.body.data.daysToExpiry).toBeGreaterThanOrEqual(29);
      expect(response.body.data.daysToExpiry).toBeLessThanOrEqual(30);
    });
  });
});
