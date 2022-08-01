
import {Spot} from '@binance/connector'
import QuotesDB from './QuotesDB'
import {LivePortfolioManager, VirtualPortfolioManager} from './PortfolioManager'
import {streamCollection, AllTickerStream, binancePriceStream, BacktestingPriceStream} from './BinanceSocket'
class IBrokerManager {
    constructor ({config, db, lggr, stats}) {
        this.logger=lggr
        this.db=db
        this.stats=stats
        this.config=config
    }
    getFee() {}
    getCurrentPrice(ticker) {}
    getCurrentCandle(ticker) {}
    trade (source, dest, sourceQty) {    }
    setOnDataHandler(handler) {
        this.onDataHandler=handler;
    }
    setOnInitDataHandler(handler) {
        this.onInitDataHandler=handler;
    }
    subscribeTicker(ticker,handler) {
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
    constructor ({config, db, lggr, stats}) {
        super({config,db,lggr, stats})
        console.log("LiveBrokerManager Init");


        this.portfolio_manager=new LivePortfolioManager(this);
        //const ats=new AllTickerStream('ETHUSDT','1m',this)
        //streamCollection.openStream(ats)
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
    subscribeTicker(ticker,handler) {
        binancePriceStream.subscribeTicker('ETHUSDT',this.onData.bind(this))
    }

    getCurrentCandle(ticker) {

    }

    trade (source, dest, sourceQty) {
        this.portfolio_manager.trade(source, dest, sourceQty, this.getCurrentPrice(source+dest))        
    }



}


// Manager for feeding historical data
export class BacktestingBrokerManager extends IBrokerManager { 
    constructor ({config, db, lggr, stats}) {
        super({config,db,lggr, stats})
        this.portfolio_manager=new VirtualPortfolioManager();
        startDate=new Date(2022,1,1,0,0,0)
        endDate=startDate+2*60*1000
        this.backtestingPriceStream=new BacktestingPriceStream(startDate,endDate)
    }
    setTime(time) {
        this.currentTime=time;
    }
    subscribeTicker(ticker,handler) {
        this.backtestingPriceStream.subscribeTicker('ETHUSDT',this.onData.bind(this))
    }

    getFee() { return 0.005 }
    getCurrentDate () {
        return this.currentTime
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
