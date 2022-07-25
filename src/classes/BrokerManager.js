
import {Spot} from '@binance/connector'
import QuotesDB from './QuotesDB'
import {LivePortfolioManager, VirtualPortfolioManager} from './PortfolioManager'

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

}

export class LiveBrokerManager extends IBrokerManager {
    constructor ({config, db, lggr, stats}) {
        super({config,db,lggr, stats})
        console.log("LiveBrokerManager Init");

        const apiKey = process.env['API_KEY']
        const apiSecret = process.env['API_SECRET']

        const client = new Spot(apiKey, apiSecret, {logger: lggr})
        this.client=client
        this.portfolio_manager=new LivePortfolioManager(this);

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

    getCurrentCandle(ticker) {

    }

    trade (source, dest, sourceQty) {
        this.portfolio_manager.trade(source, dest, sourceQty, this.getCurrentPrice(source+dest))        
    }

}


// Manager for feeding historical data
export class BacktestingBrokerManager extends IBrokerManager { 
    constructor ({config, db, logger, stats}) {
        super({config,db,lggr, stats})
        this.portfolio_manager=new VirtualPortfolioManager();
    }
    setTime(time) {
        this.currentTime=time;
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
