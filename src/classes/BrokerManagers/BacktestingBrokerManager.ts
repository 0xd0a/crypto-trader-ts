import { VirtualPortfolioManager } from "../PortfolioManager/VirtualPortfolioManager";
import { BacktestingPriceStream } from "../PriceStream/BacktestingPriceStream";
import { IBrokerManager } from "./IBrokerManager";

// Manager used to feed historical data

export class BacktestingBrokerManager extends IBrokerManager {
    constructor({ config, db, lggr, stats, binanceMainClient, trader }) {
        super({ config, db, lggr, stats });
        this.portfolio_manager = new VirtualPortfolioManager();
        this.trader = trader;
        const startDate = config.startDate;
        const endDate = config.endDate;
        const interval = config.interval;
        this.backtestingPriceStream = new BacktestingPriceStream(
            startDate,
            endDate,
            interval,
            db,
            binanceMainClient,
            this
        ); // TEMP

        // this.backtestingPriceStream.setOnFinishCallback(this.onFinishCallback.bind(this))
    }

    setTime(time) {
        this.currentTime = time;
    }
    subscribeTicker(ticker, interval, handler) {
        this.backtestingPriceStream.subscribeTicker(
            ticker,
            interval,
            this.onData.bind(this)
        );
    }
    async generateData(date) {
        await this.backtestingPriceStream.getData(date);
    }
    getFee() {
        return 0.005;
    }
    getCurrentDate() {
        return this.currentTime;
    }
    finish() {
        this.trader.close();
    }
    close() {
        console.log("Trade log: ", this.portfolio_manager.getTradeLog());
        console.log("Balance: ", this.portfolio_manager.getPortfolio());

        this.backtestingPriceStream.close();
    }
}
