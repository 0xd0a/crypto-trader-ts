

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
    async trade(source,dest,sourceQty, price) {
        //const result=await generatearealtrade()
        this.trade_log.push({source:source, dest:dest, sourceQty: sourceQty, price: price, date:date})

        return {
            result:0
        }
    }
}

export class VirtualPortfolioManager extends IPortfolioManager{
    constructor (manager) {
        super()
        this.portfolio={}
        this.manager=manager
    }

    getPortfolio () { return this.portfolio }
    getTradeLog () { return this.trade_log }
    async trade(source, dest, destQty, price, date) {
        if(!( source in this.portfolio) ) this.portfolio[source]=0
        if(!( dest in this.portfolio) ) this.portfolio[dest]=0
        this.portfolio[source]-=destQty*price;
        this.portfolio[dest]+=destQty;

        this.trade_log.push({source:source, dest:dest, destQty: destQty, price: price, date:date})
        
        return {
            result:1,
        }
    }
}