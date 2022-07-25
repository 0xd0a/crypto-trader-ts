class Trader {

    constructor () {
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