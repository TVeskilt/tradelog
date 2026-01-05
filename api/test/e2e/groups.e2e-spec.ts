import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TradeType, OptionType, TradeStatus, StrategyType } from '@prisma/client';

describe('Groups API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

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

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.group.deleteMany();
    await prisma.trade.deleteMany();
  });

  describe('POST /v1/groups', () => {
    it('should create a new group successfully', async () => {
      const trade1 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.SELL,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 850.0,
          status: TradeStatus.OPEN,
        },
      });

      const trade2 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-03-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 900.0,
          status: TradeStatus.OPEN,
        },
      });

      const createGroupDto = {
        name: 'Calendar Spread Feb-15-2026',
        strategyType: StrategyType.CALENDAR_SPREAD,
        tradeUuids: [trade1.uuid, trade2.uuid],
        notes: 'Selling Feb-15 $150 call, buying Mar-15 $150 call',
      };

      const response = await request(app.getHttpServer()).post('/v1/groups').send(createGroupDto).expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject({
        name: 'Calendar Spread Feb-15-2026',
        strategyType: StrategyType.CALENDAR_SPREAD,
        notes: 'Selling Feb-15 $150 call, buying Mar-15 $150 call',
        totalCostBasis: 1500.0,
        totalCurrentValue: 1750.0,
        profitLoss: 250.0,
      });

      expect(response.body.data).toHaveProperty('uuid');
      expect(response.body.data).toHaveProperty('closingExpiry');
      expect(response.body.data).toHaveProperty('daysUntilClosingExpiry');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('trades');
      expect(response.body.data.trades).toHaveLength(2);

      expect(response.body.data).not.toHaveProperty('createdAt');
      expect(response.body.data).not.toHaveProperty('updatedAt');
    });

    it('should return 400 for less than 2 trades', async () => {
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

      const createGroupDto = {
        name: 'Invalid Group',
        strategyType: StrategyType.CUSTOM,
        tradeUuids: [trade.uuid],
      };

      await request(app.getHttpServer()).post('/v1/groups').send(createGroupDto).expect(400);
    });

    it('should return 400 for non-existent trade UUIDs', async () => {
      const createGroupDto = {
        name: 'Invalid Group',
        strategyType: StrategyType.CUSTOM,
        tradeUuids: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
      };

      await request(app.getHttpServer()).post('/v1/groups').send(createGroupDto).expect(400);
    });

    it('should update trades with groupUuid in transaction', async () => {
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
        },
      });

      const createGroupDto = {
        name: 'SPY Spread',
        strategyType: StrategyType.CALENDAR_SPREAD,
        tradeUuids: [trade1.uuid, trade2.uuid],
      };

      const response = await request(app.getHttpServer()).post('/v1/groups').send(createGroupDto).expect(201);

      const updatedTrade1 = await prisma.trade.findUnique({ where: { uuid: trade1.uuid } });
      const updatedTrade2 = await prisma.trade.findUnique({ where: { uuid: trade2.uuid } });

      expect(updatedTrade1?.groupUuid).toBe(response.body.data.uuid);
      expect(updatedTrade2?.groupUuid).toBe(response.body.data.uuid);
    });
  });

  describe('GET /v1/groups', () => {
    it('should return empty array when no groups exist', async () => {
      const response = await request(app.getHttpServer()).get('/v1/groups').expect(200);

      expect(response.body).toEqual({ data: [] });
    });

    it('should return all groups with metrics', async () => {
      const trade1 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.SELL,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 850.0,
          status: TradeStatus.OPEN,
        },
      });

      const trade2 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-03-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 900.0,
          status: TradeStatus.OPEN,
        },
      });

      const group = await prisma.group.create({
        data: {
          name: 'Test Group',
          strategyType: StrategyType.CALENDAR_SPREAD,
        },
      });

      await prisma.trade.updateMany({
        where: { uuid: { in: [trade1.uuid, trade2.uuid] } },
        data: { groupUuid: group.uuid },
      });

      const response = await request(app.getHttpServer()).get('/v1/groups').expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toHaveProperty('uuid', group.uuid);
      expect(response.body.data[0]).toHaveProperty('closingExpiry');
      expect(response.body.data[0]).toHaveProperty('daysUntilClosingExpiry');
      expect(response.body.data[0]).toHaveProperty('status');
      expect(response.body.data[0]).toHaveProperty('totalCostBasis', 1500.0);
      expect(response.body.data[0]).toHaveProperty('totalCurrentValue', 1750.0);
      expect(response.body.data[0]).toHaveProperty('profitLoss', 250.0);
      expect(response.body.data[0].trades).toHaveLength(2);

      expect(response.body.data[0]).not.toHaveProperty('createdAt');
      expect(response.body.data[0]).not.toHaveProperty('updatedAt');
    });
  });

  describe('GET /v1/groups/:uuid', () => {
    it('should return a single group by UUID', async () => {
      const trade1 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.SELL,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 850.0,
          status: TradeStatus.OPEN,
        },
      });

      const trade2 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-03-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 900.0,
          status: TradeStatus.OPEN,
        },
      });

      const group = await prisma.group.create({
        data: {
          name: 'Calendar Spread',
          strategyType: StrategyType.CALENDAR_SPREAD,
        },
      });

      await prisma.trade.updateMany({
        where: { uuid: { in: [trade1.uuid, trade2.uuid] } },
        data: { groupUuid: group.uuid },
      });

      const response = await request(app.getHttpServer()).get(`/v1/groups/${group.uuid}`).expect(200);

      expect(response.body.data).toMatchObject({
        uuid: group.uuid,
        name: 'Calendar Spread',
        strategyType: StrategyType.CALENDAR_SPREAD,
        totalCostBasis: 1500.0,
        totalCurrentValue: 1750.0,
        profitLoss: 250.0,
      });

      expect(response.body.data.trades).toHaveLength(2);
      expect(response.body.data).toHaveProperty('closingExpiry');
      expect(response.body.data).toHaveProperty('daysUntilClosingExpiry');
    });

    it('should return 404 when group not found', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app.getHttpServer()).get(`/v1/groups/${fakeUuid}`).expect(404);

      expect(response.body.message).toContain('not found');
    });
  });

  describe('PATCH /v1/groups/:uuid', () => {
    it('should update a group successfully', async () => {
      const trade1 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.SELL,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 850.0,
          status: TradeStatus.OPEN,
        },
      });

      const trade2 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-03-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 900.0,
          status: TradeStatus.OPEN,
        },
      });

      const group = await prisma.group.create({
        data: {
          name: 'Original Name',
          strategyType: StrategyType.CALENDAR_SPREAD,
        },
      });

      await prisma.trade.updateMany({
        where: { uuid: { in: [trade1.uuid, trade2.uuid] } },
        data: { groupUuid: group.uuid },
      });

      const updateDto = {
        name: 'Updated Name',
        notes: 'Updated notes',
      };

      const response = await request(app.getHttpServer()).patch(`/v1/groups/${group.uuid}`).send(updateDto).expect(200);

      expect(response.body.data).toMatchObject({
        uuid: group.uuid,
        name: 'Updated Name',
        notes: 'Updated notes',
        strategyType: StrategyType.CALENDAR_SPREAD,
      });
    });

    it('should allow partial updates', async () => {
      const trade1 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.SELL,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 850.0,
          status: TradeStatus.OPEN,
        },
      });

      const trade2 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-03-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 900.0,
          status: TradeStatus.OPEN,
        },
      });

      const group = await prisma.group.create({
        data: {
          name: 'Original Name',
          strategyType: StrategyType.CALENDAR_SPREAD,
          notes: 'Original notes',
        },
      });

      await prisma.trade.updateMany({
        where: { uuid: { in: [trade1.uuid, trade2.uuid] } },
        data: { groupUuid: group.uuid },
      });

      const updateDto = {
        strategyType: StrategyType.CUSTOM,
      };

      const response = await request(app.getHttpServer()).patch(`/v1/groups/${group.uuid}`).send(updateDto).expect(200);

      expect(response.body.data.strategyType).toBe(StrategyType.CUSTOM);
      expect(response.body.data.name).toBe('Original Name');
      expect(response.body.data.notes).toBe('Original notes');
    });

    it('should return 404 when updating non-existent group', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      await request(app.getHttpServer())
        .patch(`/v1/groups/${fakeUuid}`)
        .send({ name: 'New Name' })
        .expect(404);
    });
  });

  describe('DELETE /v1/groups/:uuid', () => {
    it('should delete a group successfully', async () => {
      const trade1 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.SELL,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 850.0,
          status: TradeStatus.OPEN,
        },
      });

      const trade2 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-03-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 900.0,
          status: TradeStatus.OPEN,
        },
      });

      const group = await prisma.group.create({
        data: {
          name: 'Test Group',
          strategyType: StrategyType.CALENDAR_SPREAD,
        },
      });

      await prisma.trade.updateMany({
        where: { uuid: { in: [trade1.uuid, trade2.uuid] } },
        data: { groupUuid: group.uuid },
      });

      const response = await request(app.getHttpServer()).delete(`/v1/groups/${group.uuid}`).expect(200);

      expect(response.body).toEqual({ data: null });

      const deletedGroup = await prisma.group.findUnique({
        where: { uuid: group.uuid },
      });
      expect(deletedGroup).toBeNull();

      const trade1AfterDelete = await prisma.trade.findUnique({ where: { uuid: trade1.uuid } });
      const trade2AfterDelete = await prisma.trade.findUnique({ where: { uuid: trade2.uuid } });
      expect(trade1AfterDelete).not.toBeNull();
      expect(trade2AfterDelete).not.toBeNull();
      expect(trade1AfterDelete?.groupUuid).toBeNull();
      expect(trade2AfterDelete?.groupUuid).toBeNull();
    });

    it('should return 404 when deleting non-existent group', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      await request(app.getHttpServer()).delete(`/v1/groups/${fakeUuid}`).expect(404);
    });
  });

  describe('Derived Metrics Calculation', () => {
    it('should calculate closingExpiry as earliest trade expiry', async () => {
      const trade1 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.SELL,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 850.0,
          status: TradeStatus.OPEN,
        },
      });

      const trade2 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-03-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 900.0,
          status: TradeStatus.OPEN,
        },
      });

      const group = await prisma.group.create({
        data: {
          name: 'Test Group',
          strategyType: StrategyType.CALENDAR_SPREAD,
        },
      });

      await prisma.trade.updateMany({
        where: { uuid: { in: [trade1.uuid, trade2.uuid] } },
        data: { groupUuid: group.uuid },
      });

      const response = await request(app.getHttpServer()).get(`/v1/groups/${group.uuid}`).expect(200);

      expect(new Date(response.body.data.closingExpiry)).toEqual(new Date('2026-02-15'));
    });

    it('should calculate P&L correctly', async () => {
      const trade1 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-02-15'),
          tradeType: TradeType.SELL,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 1000.0,
          currentValue: 1200.0,
          status: TradeStatus.OPEN,
        },
      });

      const trade2 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date('2026-03-15'),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 800.0,
          currentValue: 700.0,
          status: TradeStatus.OPEN,
        },
      });

      const group = await prisma.group.create({
        data: {
          name: 'Test Group',
          strategyType: StrategyType.CALENDAR_SPREAD,
        },
      });

      await prisma.trade.updateMany({
        where: { uuid: { in: [trade1.uuid, trade2.uuid] } },
        data: { groupUuid: group.uuid },
      });

      const response = await request(app.getHttpServer()).get(`/v1/groups/${group.uuid}`).expect(200);

      expect(response.body.data.totalCostBasis).toBe(1800.0);
      expect(response.body.data.totalCurrentValue).toBe(1900.0);
      expect(response.body.data.profitLoss).toBe(100.0);
    });

    it('should calculate daysUntilClosingExpiry correctly', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const trade1 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: futureDate,
          tradeType: TradeType.SELL,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 850.0,
          status: TradeStatus.OPEN,
        },
      });

      const trade2 = await prisma.trade.create({
        data: {
          symbol: 'AAPL',
          strikePrice: 150.0,
          expiryDate: new Date(futureDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          tradeType: TradeType.BUY,
          optionType: OptionType.CALL,
          quantity: 10,
          costBasis: 750.0,
          currentValue: 900.0,
          status: TradeStatus.OPEN,
        },
      });

      const group = await prisma.group.create({
        data: {
          name: 'Test Group',
          strategyType: StrategyType.CALENDAR_SPREAD,
        },
      });

      await prisma.trade.updateMany({
        where: { uuid: { in: [trade1.uuid, trade2.uuid] } },
        data: { groupUuid: group.uuid },
      });

      const response = await request(app.getHttpServer()).get(`/v1/groups/${group.uuid}`).expect(200);

      expect(response.body.data.daysUntilClosingExpiry).toBeGreaterThanOrEqual(29);
      expect(response.body.data.daysUntilClosingExpiry).toBeLessThanOrEqual(30);
    });
  });
});
