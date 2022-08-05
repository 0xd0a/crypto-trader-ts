-- CreateTable
CREATE TABLE `BacktestingJobs` (
    `id` VARCHAR(191) NOT NULL,
    `JobStarted` DATETIME(3) NOT NULL,
    `JobFinished` DATETIME(3) NOT NULL,
    `JobStatus` BOOLEAN NOT NULL,
    `params` JSON NOT NULL,
    `resultTrades` JSON NOT NULL,
    `resultPortfolio` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
