export class IPortfolioManager {
    trade_log = [];
    constructor() { }

    getPortfolio() { }
    trade(type, source, dest, destQty, price) { }
    getTradeLog() {
        return this.trade_log;
    }
}
