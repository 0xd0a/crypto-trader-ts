/*
  Warnings:

  - Added the required column `volume` to the `Quotes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Quotes` ADD COLUMN `volume` DOUBLE NOT NULL;
