import { Interval, IntervalInSeconds } from './BrokerManager'
import Candle from './Candle'
import Semaphore from './Semaphore'

export default class QuotesDB {
    constructor (binanceManager, db) {
        this.binanceManager=binanceManager // TODO throw err?
        this.db=db
        this.db_semaphore=new Semaphore()
    }
    async getQuote(ticker, interval, time) {
        // get from DB
        // if not in the DB then fetch from binance and store in the DB
        // set seconds to "0" cause we currently don't work with seconds
        
        time.setSeconds(0)
        
        if(interval==Interval.FiveMinutes) 
            time.setMinutes(Math.floor(time.getMinutes()/5)*5)

        time.setMilliseconds(0)
        var l1
        await this.db_semaphore.lock()
        try {
            l1=await this.db.Quotes.findFirstOrThrow({
                where: {ticker: {equals: ticker}, timeframe:IntervalInSeconds[interval], opentime: {equals: time}  }  
            });
            console.log("Found in the offline DB");
        } catch (err) {
            console.log(time)
            console.log("Couldn't find the candle. fetching from the server")
            
            try {
                var kl=await this.binanceManager.getKlines({symbol:ticker, interval:interval, startTime: time.getTime()})
            } catch (error) {
                console.log("Error while fetching KLINES", error)
            }
            console.log("KL ", kl.length)
            
            const a=kl.map((v)=>{return { ticker:ticker,timeframe:IntervalInSeconds[interval],isCandle:true, opentime:new Date(parseInt(v[0])),
                priceO:parseFloat(v[1]),priceH:parseFloat(v[2]), priceL:parseFloat(v[3]), 
                priceC:parseFloat(v[4]), volume:parseFloat(v[5]), price:0} }) // new Candle({ opentime:v[0],priceO:v[1],priceH:v[2], priceL:v[3], priceC:v[4], volume:v[5] }) })
            // console.log(a)
            try {
                var n_created=await this.db.Quotes.createMany({data: a, skipDuplicates: true})  
            } catch (error) {
                console.log("Error while adding QUOTES to cache database: "+error) 
            } 
            console.log("Added "+n_created.toString()+" quotes")

            // try to fetch it again
            try {
                l1=await this.db.Quotes.findFirstOrThrow({
                    where: {ticker: {equals: ticker}, timeframe: IntervalInSeconds[interval], opentime: {equals: time}  }  
                })
                console.log("Found candle")
                console.log(l1)
            } catch (error) {
                console.log("#2 Still couldn't find it")
            }
        } finally {
            this.db_semaphore.unlock() // unlock all the other "threads"
        }   
        return l1    
        // will be used for both backtesting and live trading?
    }

    saveQuote(ticker, time, value, isCandle, candle ) {
        // save a value to DB
    }
}