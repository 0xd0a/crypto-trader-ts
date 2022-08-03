import { MainClient } from "binance"

class IPortfolioManager {
    trade_log = []
    constructor() { }

    getPortfolio() { }
    trade(type, source, dest, destQty, price) { }
    getTradeLog() {
        return this.trade_log
    }
}

export class LivePortfolioManager extends IPortfolioManager {
    constructor(manager) {
        super()
        this.manager = manager
        this.virtual=new VirtualPortfolioManager(manager)
        const apiKey = process.env['API_KEY']
        const apiSecret = process.env['API_SECRET']

        this.mainclient = new MainClient({
            api_key: apiKey,
            api_secret: apiSecret,
        });
    }
    getPortfolio() {
        this.virtual.getPortfolio()
    }
    async trade(type, source, dest, qty, price, date) {
        
        const newOrder = {
            symbol: (type=='BUY')?(dest+source):(source+dest),
            side: type,
            type: 'LIMIT',
            price:price,
            qty:qty
        }
        return this.client.submitNewOrder(newOrder)
            .then(r => {
                this.trade_log.push({ type: type, source: source, dest: dest, destQty: qty, price: price, date: date })
                this.virtual.trade(type,source,dest,qty,price,date) // price ==> TODO
                return {
                    result: 1,
                    r: r
                }
            })
            .catch(e => {
                console.log("Couldn't execute the order ", e)
                return {
                    result: 0,
                    r: e
                }
            })


    }
}

export class VirtualPortfolioManager extends IPortfolioManager {
    constructor(manager) {
        super()
        this.portfolio = {}
        this.manager = manager
    }

    getPortfolio() { return this.portfolio }
    getTradeLog() { return this.trade_log }
    async trade(type, source, dest, qty, price, date) {
        if (!(source in this.portfolio)) this.portfolio[source] = 0
        if (!(dest in this.portfolio)) this.portfolio[dest] = 0
        if(type=='BUY') {
            this.portfolio[source] -= qty * price;
            this.portfolio[dest] += qty;
        } else {
            this.portfolio[source] -= qty ;
            this.portfolio[dest] += qty*price;
        }

        this.trade_log.push({ type: type, source: source, dest: dest, destQty: qty, price: price, date: date })

        return {
            result: 1,
            r: {
                status: "FILLED"
            }
        }
    }
}