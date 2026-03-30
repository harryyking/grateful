/*
  Warnings:

  - You are about to drop the `Promise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Testimony` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_testimonyId_fkey";

-- DropForeignKey
ALTER TABLE "Testimony" DROP CONSTRAINT "Testimony_authorId_fkey";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "reaction" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "encouragementTime" SET DEFAULT 'morning';

-- DropTable
DROP TABLE "Promise";

-- DropTable
DROP TABLE "Reaction";

-- DropTable
DROP TABLE "Testimony";
