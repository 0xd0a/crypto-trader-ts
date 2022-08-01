

class IPortfolioManager {
    trade_log=[]
    constructor () {}

    getPortfolio() {}
    trade(source, dest, sourceQty, price) {}
    getTradeLog() {
        return this.trade_log
    }
}

export class LivePortfolioManager extends IPortfolioManager {
    constructor (manager) {
        super()
        this.manager=manager
    }
    getPortfolio () {
        // await getPortfoliofromclient
    }
    trade(source,dest,sourceQty, price) {
        //await generatearealtrade()
        //this.trade_log.push({source:source, dest:dest, sourceQty: sourceQty, price: price, date:this.manager.getCurrentDate()})
    }
}

export class VirtualPortfolioManager extends IPortfolioManager{
    constructor (manager) {
        super()
        this.portfolio={}
        this.manager=manager
    }

    getPortfolio () {return this.portfolio}

    trade(source, dest, sourceQty, price) {
        this.portfolio[source]-=sourceQty;
        this.portfolio[dest]+=sourceQty*price;

        this.trade_log.push({source:source, dest:dest, sourceQty: sourceQty, price: price, date:this.manager.getCurrentDate()})
    }
}