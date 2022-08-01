// To run an algo one has to instantiate this class and it will take care of feeding data to the algorithm.

import { binancePriceStream } from "./BinanceSocket"
import LiveBrokerManager, { BacktestingBrokerManager } from "./BrokerManager"


export default class Trader {
    finishResolve
    // traderType: {"LIVE", "HISTORY", "LIVEDRYRUN"}
    constructor ({traderType="LIVE", config, db, lggr, stats, strategy}) {
        this.traderType=traderType
        if(!strategy) {
            console.log("Please initialize trader with a strategy")
            return
        }
        this.strategy=strategy

        if(this.traderType == "LIVE")
            this.brokerManager=new LiveBrokerManager({config:config, db:db,lggr, stats})
        else if(this.traderType == "HISTORY")
            this.brokerManager=new BacktestingBrokerManager({config:config, db:db,lggr, stats})

        this.strategy.setBrokerManager(this.brokerManager)
        this.strategy.setTrader(this) 

        this.strategy.init()

        this.brokerManager.setOnDataHandler(this.strategy.onData.bind(this.strategy))
        this.brokerManager.setOnInitDataHandler(this.strategy.onInitData.bind(this.strategy))
        traderCollection.addTrader(this)
        // init "data" stream:
        // 1) websocket stream (CandleStick stream from BinanceSocket.js) which will be triggered by the handler function
        // 2) history data stream (QuotesDBStream?) or emulate data stream manually

        // init BrokerManager

        // init Algorithm

    }

    async run () {
        // A run function which will run the Algorithm using BrokerManager as (Portfolio and borker manager) and "data stream" (either emulated or Live)
        // var data
        // while(data=await this.brokerManager.newData())
        //     console.log(data)
        console.log("Trader::run starting")
        return new Promise ((resolve) => {
            this.finishResolve=resolve
            // setTimeout(()=>{console.log("Finishing");
            //     this.close();
            //     resolve()
            // },10000)
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
        this.traders.push(trader);
    }

    closeTrader(trader) {
        this.traders.find(t => {t==trader})?.close()
    }

    async run() {
        //console.log(this.traders.map(t=>t.run()))
        return Promise.all(this.traders.map(t=>t.run()))
    }

    async terminate () {
        this.traders.forEach(async t=>{await t.close()})

        console.log("TraderCollection::closeAll")
        binancePriceStream.close()
    }
}

export const traderCollection=TraderCollection.getInstance()

