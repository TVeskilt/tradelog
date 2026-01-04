-- CreateEnum
CREATE TYPE "TradeType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "OptionType" AS ENUM ('CALL', 'PUT');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('OPEN', 'CLOSING_SOON', 'CLOSED');

-- CreateEnum
CREATE TYPE "StrategyType" AS ENUM ('CALENDAR_SPREAD', 'RATIO_CALENDAR_SPREAD', 'CUSTOM');

-- CreateTable
CREATE TABLE "Group" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strategyType" "StrategyType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Trade" (
    "uuid" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "strikePrice" DECIMAL(10,2) NOT NULL,
    "expiryDate" DATE NOT NULL,
    "tradeType" "TradeType" NOT NULL,
    "optionType" "OptionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "costBasis" DECIMAL(10,2) NOT NULL,
    "currentValue" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "groupUuid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("uuid")
);

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_groupUuid_fkey" FOREIGN KEY ("groupUuid") REFERENCES "Group"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
