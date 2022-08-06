/*
  Warnings:

  - You are about to alter the column `JobStatus` on the `BacktestingJobs` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `BacktestingJobs` MODIFY `JobStatus` VARCHAR(191) NULL;
