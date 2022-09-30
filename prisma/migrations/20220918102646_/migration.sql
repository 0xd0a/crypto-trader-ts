/*
  Warnings:

  - You are about to drop the column `Name` on the `StrategiesCode` table. All the data in the column will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `EnvironmentId` to the `StrategiesCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `Post_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `Profile` DROP FOREIGN KEY `Profile_userId_fkey`;

-- AlterTable
ALTER TABLE `BacktestingJobs` ADD COLUMN `UserId` INTEGER NULL,
    ADD COLUMN `environmentId` INTEGER NULL;

-- AlterTable
ALTER TABLE `StrategiesCode` DROP COLUMN `Name`,
    ADD COLUMN `EnvironmentId` INTEGER NOT NULL,
    ADD COLUMN `Path` VARCHAR(191) NOT NULL DEFAULT '';

-- DropTable
DROP TABLE `Post`;

-- DropTable
DROP TABLE `Profile`;

-- CreateTable
CREATE TABLE `Environment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `UserId` INTEGER NOT NULL,
    `Name` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BacktestingJobs` ADD CONSTRAINT `BacktestingJobs_environmentId_fkey` FOREIGN KEY (`environmentId`) REFERENCES `Environment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BacktestingJobs` ADD CONSTRAINT `BacktestingJobs_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StrategiesCode` ADD CONSTRAINT `StrategiesCode_EnvironmentId_fkey` FOREIGN KEY (`EnvironmentId`) REFERENCES `Environment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Environment` ADD CONSTRAINT `Environment_UserId_fkey` FOREIGN KEY (`UserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
