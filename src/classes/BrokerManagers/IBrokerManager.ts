export class IBrokerManager {
    constructor({ config, db, lggr, stats }) {
        this.logger = lggr;
        this.db = db;
        this.stats = stats;
        this.config = config;
        this.onFinishCallback = null;
    }
    getFee() { }
    getCurrentPrice(ticker) { }
    getCurrentCandle(ticker) { }
    async trade(type, source, dest, destQty, exchangeRate, date) {
        await this.portfolio_manager.trade(
            type,
            source,
            dest,
            destQty,
            exchangeRate,
            date
        );
    }

    setOnDataHandler(handler) {
        this.onDataHandler = handler;
    }
    setOnInitDataHandler(handler) {
        this.onInitDataHandler = handler;
    }
    subscribeTicker(ticker, interval, handler) {
        throw new Error("Have to implement subscribeTicker");
    }
    onData(data) {
        this.onDataHandler(data);
    }
    initData(data) {
        this.onInitDataHandler(data);
    }
}
