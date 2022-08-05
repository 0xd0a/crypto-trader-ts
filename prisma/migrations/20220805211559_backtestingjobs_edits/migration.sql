-- AlterTable
ALTER TABLE `BacktestingJobs` MODIFY `JobFinished` DATETIME(3) NULL,
    MODIFY `JobStatus` BOOLEAN NULL,
    MODIFY `params` JSON NULL,
    MODIFY `resultTrades` JSON NULL,
    MODIFY `resultPortfolio` JSON NULL;
