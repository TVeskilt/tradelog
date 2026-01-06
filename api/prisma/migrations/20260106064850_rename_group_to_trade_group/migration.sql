/*
  Warnings:

  - You are about to drop the column `groupUuid` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_groupUuid_fkey";

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "groupUuid",
ADD COLUMN     "tradeGroupUuid" TEXT;

-- DropTable
DROP TABLE "Group";

-- CreateTable
CREATE TABLE "trade_groups" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strategyType" "StrategyType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trade_groups_pkey" PRIMARY KEY ("uuid")
);

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_tradeGroupUuid_fkey" FOREIGN KEY ("tradeGroupUuid") REFERENCES "trade_groups"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
