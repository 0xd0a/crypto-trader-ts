
import {Spot} from '@binance/connector'
import QuotesDB from './QuotesDB'
import {LivePortfolioManager, VirtualPortfolioManager} from './PortfolioManager'
import {streamCollection, AllTickerStream, binancePriceStream, BacktestingPriceStream} from './BinanceSocket'

export const Interval={
    Minute: '1m',
    FiveMinutes: '5m',
    Hour: '1h',
    Day: '1d'
}

export const IntervalInSeconds={
    '1m':60,
    '5m':300,
    '1h':3600,
    '1d':86400
}
class IBrokerManager {
    constructor ({config, db, lggr, stats}) {
        this.logger=lggr
        this.db=db
        this.stats=stats
        this.config=config
        this.onFinishCallback=null
    }
    getFee() {}
    getCurrentPrice(ticker) {}
    getCurrentCandle(ticker) {}
    async trade (type, source, dest, destQty, exchangeRate, date) {
        await this.portfolio_manager.trade(type, source, dest, destQty, exchangeRate, date)        
    }

    setOnDataHandler(handler) {
        this.onDataHandler=handler;
    }
    setOnInitDataHandler(handler) {
        this.onInitDataHandler=handler;
    }
    subscribeTicker(ticker,interval, handler) {
        throw new Error( "Have to implement subscribeTicker")
    }
    onData(data) {
        this.onDataHandler(data)
    }
    initData(data) {
        this.onInitDataHandler(data)
    }
}

export class LiveBrokerManager extends IBrokerManager {
    constructor ({config, db, lggr, stats, binanceMainClient}) {
        super({config,db,lggr, stats})
        console.log("LiveBrokerManager Init");

        this.portfolio_manager=new LivePortfolioManager(this);
        this.rcvBuff=[]
        this.subscriptions=[]
    }
    getFee() {

    }
    getCurrentDate() {
        return new Date()
    }

    getCurrentPrice(ticker) {
        if(!this.quotes_db) this.quotes_db=new QuotesDB(this, this.db)

        return this.quotes_db.getQuote(ticker,this.getCurrentDate())

    }
    subscribeTicker(ticker,interval, handler) {
        subscriptions.push({ticker:ticker, interval:interval})
        binancePriceStream.subscribeTicker(ticker, interval, this.onData.bind(this))
    }

    onData(data) {
        if(data.k?.x) {
            this.rcvBuff.push(data)
            if (this.rcvBuff.length==this.subscriptions.length) {
                this.onDataHandler((rcvBuff.length==1)?rcvBuff[0]:rcvBuff)
                this.rcvBuff=[]
            }
        }
    }

    close() {
        binancePriceStream.close()
    }

}


// Manager for feeding historical data
export class BacktestingBrokerManager extends IBrokerManager { 
    constructor ({config, db, lggr, stats, binanceMainClient,trader}) {
        super({config,db,lggr, stats})
        this.portfolio_manager=new VirtualPortfolioManager();
        this.trader=trader
        const startDate=config.startDate
        const endDate=config.endDate
        const interval=config.interval
        this.backtestingPriceStream=new BacktestingPriceStream(startDate,endDate,interval, db,binanceMainClient,this) // TEMP
        // this.backtestingPriceStream.setOnFinishCallback(this.onFinishCallback.bind(this))
    }

    setTime(time) {
        this.currentTime=time;
    }
    subscribeTicker(ticker,interval, handler) {
        this.backtestingPriceStream.subscribeTicker(ticker,interval, this.onData.bind(this))
    }
    async generateData(date) {
        await this.backtestingPriceStream.getData(date)
    }
    getFee() { return 0.005 }
    getCurrentDate () {
        return this.currentTime
    }
    finish() {
        this.trader.close()
    }
    close() {
        console.log("Trade log: ", this.portfolio_manager.getTradeLog())
        console.log("Balance: ", this.portfolio_manager.getPortfolio())

        this.backtestingPriceStream.close()
    }
}

//
// Run on Live data but without actual trades, instead make a trade log and virtual portfolio
//
export class DryRunLiveDataBrokerManager extends LiveBrokerManager {
    constructor ({config, db, lggr, stats}) {
        super({config, db, lggr, stats})
        this.portfolio_manager= new VirtualPortfolioManager();
    }
}

export default LiveBrokerManager;
