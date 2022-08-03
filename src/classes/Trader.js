// To run an algo one has to instantiate this class and it will take care of feeding data to the algorithm.

import { config } from "../../node_modules/dotenv/lib/main"
import { binancePriceStream } from "./BinanceSocket"
import LiveBrokerManager, { BacktestingBrokerManager } from "./BrokerManager"
import {async} from 'async'

export default class Trader {
    finishResolve
    // traderType: {"LIVE", "HISTORY", "LIVEDRYRUN"}
    constructor ({traderType="LIVE", config, db, lggr, stats, strategy,binanceMainClient}) {
        this.traderType=traderType
        if(!strategy) {
            console.log("Please initialize trader with a strategy")
            return
        }
        this.strategy=strategy
        this.db=db
        this.config=config

        if(this.traderType == "LIVE")
            this.brokerManager=new LiveBrokerManager({config:config, db:db,lggr, stats, binanceMainClient})
        else if(this.traderType == "HISTORY")
            this.brokerManager=new BacktestingBrokerManager({config:config, db:db,lggr, stats, binanceMainClient, trader:this})
        else 
            throw Error("Trader traderType not supported")
        this.strategy.setBrokerManager(this.brokerManager)
        this.strategy.setTrader(this) 

        this.strategy.init()

        this.brokerManager.setOnDataHandler(this.strategy.onData.bind(this.strategy))
        this.brokerManager.setOnInitDataHandler(this.strategy.onInitData.bind(this.strategy))
        //this.brokerManager.setOnFinishCallback(this.close.bind(this))
        traderCollection.addTrader(this)
        // init "data" stream:
        // 1) websocket stream (CandleStick stream from BinanceSocket.js) which will be triggered by the handler function
        // 2) history data stream (QuotesDBStream?) or emulate data stream manually

        // init BrokerManager

        // init Algorithm
    }

    result() {
        return {
            tradelog: this.brokerManager.portfolio_manager.getTradeLog(),
            portfolio: this.brokerManager.portfolio_manager.getPortfolio()
        }
    }

    async run () {
        // A run function which will run the Algorithm using BrokerManager as (Portfolio and borker manager) and "data stream" (either emulated or Live)
        // var data
        // while(data=await this.brokerManager.newData())
        //     console.log(data)
        console.log("Trader::run starting")
        // if(this.traderType=="HISTORY") {
        //     var currentDate=new Date(this.config.startDate)
        //     const endDate=this.config.endDate
        //     const interval=this.config.interval
        //     while(currentDate<endDate) {
        //         await this.brokerManager.generateData(new Date(currentDate))
        //         currentDate.setTime(currentDate.getTime()+interval*1000)
        //     }
        //     console.log("End of backtesting cycle")
        //     return Promise.resolve()
        // }

        return new Promise ((resolve) => {
            this.finishResolve=resolve
        })
    }

    terminate() {
        if(this.finishResolve) {
            this.finishResolve()
            console.log("Finish resolve")
        }
    }

    close() {
        console.log("Trader::close Close Trader");
        //Do something with the brokerManager
        //binancePriceStream.close();
        this.brokerManager.close()
//        this.strategy.close()
        this.terminate()
    }

}

class TraderCollection {

    constructor () {
        this.traders=[]
    }

    static getInstance() {
        if (!this.instance) 
            this.instance=new TraderCollection()
        return this.instance
    }

    addTrader(trader) {
        return this.traders.push(trader)-1;
    }

    closeTrader(trader) {
        this.traders.find(t => {t==trader})?.close()
    }

    async run() {
        //console.log(this.traders.map(t=>t.run()))
        return Promise.all(this.traders.map(t=>t.run()))
    }

    async terminate () {
        for(var i=0;i<this.traders.length;i++) 
            await this.traders[i].close()

        console.log("TraderCollection::closeAll")
        //binancePriceStream.close()
    }
}

export const traderCollection=TraderCollection.getInstance()

