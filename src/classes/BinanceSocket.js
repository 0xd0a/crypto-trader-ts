`use strict`

import fetch from 'isomorphic-fetch'
import { resolve } from 'url';
import WebSocket from 'ws'
import { WebsocketClient} from 'binance';
import {Console} from 'console'
import fs from 'fs'

// TODO: make an async wrapper around WebSocket
class BinancePriceStream {
    subscriptions=[]
    constructor() {
        // const callbacks = {
        //     open: () => client.logger.log('open'),
        //     close: () => client.logger.log('closed'),
        //     message: data => client.logger.log(data)
        //   }
          const apiKey = process.env['API_KEY']
          const apiSecret = process.env['API_SECRET']
          const output = fs.createWriteStream('./logs/stdout.log')
          const errorOutput = fs.createWriteStream('./logs/stderr.log')
          const logger2 = new Console({ stdout: output, stderr: errorOutput })
          const logger = {
            ...logger2,
            silly: (...params) => {},
          };
          const wsClient = new WebsocketClient({
            api_key: apiKey,
            api_secret: apiSecret,
            beautify: true,
            // Disable ping/pong ws heartbeat mechanism (not recommended)
            // disableHeartbeat: true
          }, logger);

          this.client=wsClient
          wsClient.on('message', this.onData.bind(this))

    }

    static getInstance() {
        if (!this.instance) 
            this.instance=new BinancePriceStream()
        return this.instance
    }

    // THERE'S A BUG WITH THE LIBRARY THAT WON'T ALLOW TO SUBSCRIBE TO THE SAME TICKER TWICE
    // FIXED IT

    subscribeTicker(ticker, handler) {
        console.log("Adding subscription to ",ticker)
        const element=this.subscriptions.find(s=>s.ticker==ticker)
        if(element) {
            console.log("Trying to add subscription that already exists, adding extra handler")
            element.handler.push(handler)
            return
        }
        const ws=this.client.subscribeSpotSymbolMini24hrTicker(ticker);
        this.subscriptions.push({ticker:ticker,handler:[handler],ws:ws})
    }

    onData(data) {
        console.log("Got Data ")
        this.subscriptions.forEach(a=>{if(a.ticker==data.s && a.handler) a.handler.forEach(h=>h(data))})
    }

    close() {
        // disconnect
        console.log("Closing binancePriceStream")
        this.subscriptions.forEach(a=>{
            console.log("Closing Subscription to ",a.ticker)
            this.client.closeWs(a.ws,false)
            console.log(this.client.closeWs)
        });
    }
}

export class BacktestingPriceStream {
    currentDate
    endDate
    interval=60*1000 // 1 minute
    constructor (startDate, endDate) {
        this.currentDate=startDate
        this.endDate=endDate
        this.generateData()
    }

    generateData() {
        this.currentDate+=interval
        if(!this.quotes_db) this.quotes_db=new QuotesDB(this, this.db)

        this.subscriptions.forEach(s=>this.onData(this.quotes_db.getQuote(s.ticker,this.currentDate)))
        if (this.currentDate<this.endDate) 
            setTimeout(this.generateData.bind(this),interval)
    }

    subscribeTicker(ticker, handler) {
        console.log("Adding subscription to ",ticker)
        const element=this.subscriptions.find(s=>s.ticker==ticker)
        if(element) {
            console.log("Trying to add subscription that already exists, adding extra handler")
            element.handler.push(handler)
            return
        }
        this.subscriptions.push({ticker:ticker,handler:[handler],ws:ws})
    }

    onData(data) {
        console.log("Got Data ")
        this.subscriptions.forEach(a=>{if(a.ticker==data.s && a.handler) a.handler.forEach(h=>h(data))})
    }

}


// export class CandlestickStream extends BinanceStream {
//     constructor(symbol, interval, handler) {
//         this.symbol = symbol;
//         this.interval = interval;
//         this.handler = handler; // has to implement onData(data)
//         this.webSocketConnected = false;
//         this.webSocketHost = "wss://stream.binance.com:9443/ws/" + this.symbol + "@kline_" + this.interval;
//         this.url="https://api.binance.com/api/v3/klines?symbol=" + this.symbol.toUpperCase() + "&interval=" + this.interval + "&limit=500";
//         this.start()
//     }

// }

// export class MiniTickerStream extends BinanceStream {
//     constructor(symbol, handler) {
//         super()
//         this.symbol = symbol;
//         this.interval = interval;
//         this.handler = handler; // has to implement onData(data)
//         this.webSocketConnected = false;
//         this.webSocketHost = "wss://stream.binance.com:9443/ws/" + this.symbol + "@miniTicker";
//         this.url="https://api.binance.com/api/v3/miniTicker?symbol=" + this.symbol.toUpperCase() + "&interval=" + this.interval + "&limit=500";
//         this.start()
//     }

// }

// export class AllTickerStream extends BinanceStream {
//     // TODO Has to be a singleton and cached
//     constructor(symbol, interval, handler) {
//         super()
//         this.symbol = symbol;
//         this.interval = interval;
//         this.handler = handler; // has to implement onData(data)
//         this.webSocketConnected = false;
//         this.webSocketHost = "wss://stream.binance.com:9443/ws/!miniTicker@arr";
//         this.url="" //"https://api.binance.com/api/v3/avgPrice?symbol=" + this.symbol.toUpperCase() ;
//         this.start()
//     }
// }

const binancePriceStream= BinancePriceStream.getInstance();
export {binancePriceStream};