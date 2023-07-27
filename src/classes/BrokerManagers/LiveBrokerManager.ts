import QuotesDB from "../QuotesDB/QuotesDB";
import { LivePortfolioManager } from "../PortfolioManager/LivePortfolioManager";
import { binancePriceStream } from "../PriceStream/BinancePriceStream";
import { IBrokerManager } from "./IBrokerManager";


export class LiveBrokerManager extends IBrokerManager {
    constructor({ config, db, lggr, stats, binanceMainClient }) {
        super({ config, db, lggr, stats });
        console.log("LiveBrokerManager Init");

        this.portfolio_manager = new LivePortfolioManager(this);
        this.rcvBuff = [];
        this.subscriptions = [];
    }
    getFee() { }
    getCurrentDate() {
        return new Date();
    }

    getCurrentPrice(ticker) {
        if (!this.quotes_db) this.quotes_db = new QuotesDB(this, this.db);

        return this.quotes_db.getQuote(ticker, this.getCurrentDate());
    }
    subscribeTicker(ticker, interval, handler) {
        subscriptions.push({ ticker: ticker, interval: interval });
        binancePriceStream.subscribeTicker(
            ticker,
            interval,
            this.onData.bind(this)
        );
    }

    onData(data) {
        if (data.k?.x) {
            this.rcvBuff.push(data);
            if (this.rcvBuff.length == this.subscriptions.length) {
                this.onDataHandler(rcvBuff.length == 1 ? rcvBuff[0] : rcvBuff);
                this.rcvBuff = [];
            }
        }
    }

    close() {
        binancePriceStream.close();
    }
}
