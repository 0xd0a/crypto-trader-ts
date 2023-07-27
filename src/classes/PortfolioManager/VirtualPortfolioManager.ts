import { IPortfolioManager } from "./IPortfolioManager";


export class VirtualPortfolioManager extends IPortfolioManager {
    constructor(manager) {
        super();
        this.portfolio = {};
        this.manager = manager;
    }

    getPortfolio() {
        return this.portfolio;
    }
    getTradeLog() {
        return this.trade_log;
    }
    async trade(type, source, dest, qty, price, date) {
        if (!(source in this.portfolio)) this.portfolio[source] = 0;
        if (!(dest in this.portfolio)) this.portfolio[dest] = 0;
        if (type == "BUY") {
            this.portfolio[source] -= qty * price;
            this.portfolio[dest] += qty;
        } else {
            this.portfolio[source] -= qty;
            this.portfolio[dest] += qty * price;
        }

        this.trade_log.push({
            type: type,
            source: source,
            dest: dest,
            destQty: qty,
            price: price,
            date: date,
        });

        return {
            result: 1,
            r: {
                status: "FILLED",
            },
        };
    }
}
