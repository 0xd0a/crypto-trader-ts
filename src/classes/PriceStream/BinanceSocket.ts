// import { WebsocketClient } from "binance";
// import { Console } from "console";
// import fs from "fs";
// import QuotesDB from "./QuotesDB";
// import { IntervalInSeconds } from "./BrokerManager";

// // TODO: make an async wrapper around WebSocket
// class BinancePriceStream {
//   subscriptions = [];
//   constructor() {
//     const apiKey = process.env["API_KEY"];
//     const apiSecret = process.env["API_SECRET"];
//     const output = fs.createWriteStream("./logs/stdout.log");
//     const errorOutput = fs.createWriteStream("./logs/stderr.log");
//     const logger2 = new Console({ stdout: output, stderr: errorOutput });
//     const logger = {
//       ...logger2,
//       silly: (...params) => {},
//     };
//     const wsClient = new WebsocketClient(
//       {
//         api_key: apiKey,
//         api_secret: apiSecret,
//         beautify: true,
//         // Disable ping/pong ws heartbeat mechanism (not recommended)
//         // disableHeartbeat: true
//       },
//       logger
//     );

//     this.client = wsClient;
//     wsClient.on("message", this.onData.bind(this));
//   }

//   static getInstance() {
//     if (!this.instance) this.instance = new BinancePriceStream();
//     return this.instance;
//   }

//   // THERE'S A BUG WITH THE LIBRARY THAT WON'T ALLOW TO SUBSCRIBE TO THE SAME TICKER TWICE
//   // FIXED IT

//   subscribeTicker(ticker, interval, handler) {
//     console.log("Adding subscription to ", ticker);
//     const element = this.subscriptions.find((s) => s.ticker == ticker);
//     if (element) {
//       console.log(
//         "Trying to add subscription that already exists, adding extra handler"
//       );
//       element.handler.push(handler);
//       return;
//     }
//     //const ws=this.client.subscribeSpotSymbolMini24hrTicker(ticker); // Mini ticker
//     const ws = this.client.subscribeKlines(ticker, interval, "spot"); // Klines market
//     this.subscriptions.push({
//       ticker: ticker,
//       interval: interval,
//       handler: [handler],
//       ws: ws,
//     });
//   }

//   onData(data) {
//     console.log("Got Data ");
//     this.subscriptions.forEach((a) => {
//       if (a.ticker == data.s && a.handler) a.handler.forEach((h) => h(data));
//     });
//   }

//   close() {
//     // disconnect
//     console.log("Closing binancePriceStream");
//     this.subscriptions.forEach((a) => {
//       console.log("Closing Subscription to ", a.ticker);
//       this.client.closeWs(a.ws, false);
//       console.log(this.client.closeWs);
//     });
//   }
// }

// export class BacktestingPriceStream {
//   startDate;
//   currentDate;
//   endDate;

//   constructor(
//     startDate,
//     endDate,
//     interval,
//     db,
//     binanceMainClient,
//     brokerManager
//   ) {
//     this.currentDate = new Date(startDate);
//     this.endDate = endDate;
//     this.interval = interval;
//     this.subscriptions = [];
//     this.brokerManager = brokerManager;
//     this.db = db;
//     this.binanceMainClient = binanceMainClient;
//   }

//   async generateData() {
//     // emulate price socket with setImmediate
//     if (!this.quotes_db)
//       this.quotes_db = new QuotesDB(this.binanceMainClient, this.db);

//     for (var i = 0; i < this.subscriptions.length; i++) {
//       // forEach does not support await
//       var s = this.subscriptions[i];
//       var data = await this.quotes_db.getQuote(
//         s.ticker,
//         s.interval,
//         this.currentDate
//       );
//       if (data) {
//         var dataToPassDown = {
//           e: "kline",
//           E: data.opentime.getTime(),
//           s: data.ticker,
//           k: {
//             t: data.opentime.getTime(),
//             c: data.priceC,
//             o: data.priceO,
//             h: data.priceH,
//             l: data.priceL,
//             v: data.volume,
//             q: "0",
//             i: s.interval,
//             x: true,
//           },
//           wsMarket: "spot",
//           wsKey: "spot_kline_" + data.ticker.toLowerCase() + "_" + s.interval,
//         };

//         this.onData(dataToPassDown);
//       }
//     }

//     this.currentDate.setTime(this.currentDate.getTime() + this.interval * 1000);
//     if (this.currentDate < this.endDate)
//       this.timeOut = setImmediate(this.generateData.bind(this));
//     else this.brokerManager.finish();
//   }

// //   async getData(date) {
// //     // This is an OLD function used to be triggered by Trader class
// //     // if(!this.quotes_db) this.quotes_db=new QuotesDB(this.binanceMainClient, this.db)
// //     // for(var i=0;i<this.subscriptions.length;i++) { // instead of forEach using for
// //     //                                            // with promises
// //     //     var s=this.subscriptions[i]
// //     //     var data=await this.quotes_db.getQuote(s.ticker, this.interval, date)
// //     //     if(data){
// //     //         var dataToPassDown=
// //     //             {
// //     //                 e: '24hrMiniTicker',
// //     //                 E: data.opentime.getTime(),
// //     //                 s: data.ticker,
// //     //                 c: data.priceC,
// //     //                 o: data.priceO,
// //     //                 h: data.priceH,
// //     //                 l: data.priceL,
// //     //                 v: data.volume,
// //     //                 q: '0',
// //     //                 wsMarket: 'spot',
// //     //                 wsKey: 'spot_miniTicker_'+data.ticker.toLowerCase()+'_'
// //     //             }
// //     //         this.onData(dataToPassDown)
// //     //     }
// //     // }
// //     // console.log("GetData executed with ",date)
// //   }

//   subscribeTicker(ticker, interval, handler) {
//     console.log("Adding subscription to ", ticker);
//     // const element=this.subscriptions?.find(s=>s.ticker==ticker)
//     // if(element) {
//     //     console.log("Trying to add subscription that already exists, adding extra handler")
//     //     element.handler.push(handler)
//     //     return
//     // }
//     this.subscriptions.push({
//       ticker: ticker,
//       interval: interval,
//       handler: [handler],
//       ws: undefined,
//     });
//     this.interval = IntervalInSeconds[interval]; // TODO
//     this.generateData(); // if want to use as a stream
//   }

//   onData(data) {
//     console.log("Got Data ");
//     this.subscriptions.forEach((a) => {
//       if (a.handler) a.handler.forEach((h) => h(data));
//     });
//   }

//   close() {
//     //        clearTimeout(this.timeOut)
//   }
// }

// // export class CandlestickStream extends BinanceStream {
// //     constructor(symbol, interval, handler) {
// //         this.symbol = symbol;
// //         this.interval = interval;
// //         this.handler = handler; // has to implement onData(data)
// //         this.webSocketConnected = false;
// //         this.webSocketHost = "wss://stream.binance.com:9443/ws/" + this.symbol + "@kline_" + this.interval;
// //         this.url="https://api.binance.com/api/v3/klines?symbol=" + this.symbol.toUpperCase() + "&interval=" + this.interval + "&limit=500";
// //         this.start()
// //     }

// // }

// // export class MiniTickerStream extends BinanceStream {
// //     constructor(symbol, handler) {
// //         super()
// //         this.symbol = symbol;
// //         this.interval = interval;
// //         this.handler = handler; // has to implement onData(data)
// //         this.webSocketConnected = false;
// //         this.webSocketHost = "wss://stream.binance.com:9443/ws/" + this.symbol + "@miniTicker";
// //         this.url="https://api.binance.com/api/v3/miniTicker?symbol=" + this.symbol.toUpperCase() + "&interval=" + this.interval + "&limit=500";
// //         this.start()
// //     }

// // }

// // export class AllTickerStream extends BinanceStream {
// //     // TODO Has to be a singleton and cached
// //     constructor(symbol, interval, handler) {
// //         super()
// //         this.symbol = symbol;
// //         this.interval = interval;
// //         this.handler = handler; // has to implement onData(data)
// //         this.webSocketConnected = false;
// //         this.webSocketHost = "wss://stream.binance.com:9443/ws/!miniTicker@arr";
// //         this.url="" //"https://api.binance.com/api/v3/avgPrice?symbol=" + this.symbol.toUpperCase() ;
// //         this.start()
// //     }
// // }

// const binancePriceStream = BinancePriceStream.getInstance();
// //const backtestingPriceStream= BacktestingPriceStream.getInstance();

// export { binancePriceStream };

import { Console } from "console";
import fs from "fs";
import { config } from "dotenv";

config(); // Loads environment variables from a .env file

export interface Subscription {
  ticker: string;
  interval: string;
  handler: Function[];
  ws: any;
}

export interface DataToPass {
  e: string;
  E: number;
  s: string;
  k: any;
  wsMarket: string;
  wsKey: string;
}

const output = fs.createWriteStream("./logs/stdout.log");
const errorOutput = fs.createWriteStream("./logs/stderr.log");
export const logger = new Console({ stdout: output, stderr: errorOutput });
