// To run an algo one has to instantiate this class and it will take care of feeding data to the algorithm.

import LiveBrokerManager, { BacktestingBrokerManager } from "./BrokerManager"


class Trader {

    // traderType: {"LIVE", "HISTORY", "LIVEDRYRUN"}
    constructor ({traderType="LIVE", config, db, lggr, stats}) {
        this.traderType=traderType

        if(this.traderType == "LIVE")
            this.brokerManager=new LiveBrokerManager({config:config, db:db,lggr, stats})
        else if(this.traderType == "")
            this.brokerManager=new BacktestingBrokerManager({config:config, db:db,lggr, stats})
        
        
        // init "data" stream:
        // 1) websocket stream (CandleStick stream from BinanceSocket.js) which will be triggered by the handler function
        // 2) history data stream (QuotesDBStream?) or emulate data stream manually

        // init BrokerManager

        // init Algorithm

    }

    run () {
        // A run function which will run the Algorithm using BrokerManager as (Portfolio and borker manager) and "data stream" (either emulated or Live)


    }

}