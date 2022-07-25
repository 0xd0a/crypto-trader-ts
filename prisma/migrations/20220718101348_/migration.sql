/*
  Warnings:

  - A unique constraint covering the columns `[ticker,opentime,timeframe]` on the table `Quotes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Quotes_ticker_opentime_timeframe_key` ON `Quotes`(`ticker`, `opentime`, `timeframe`);
