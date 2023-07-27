import QuotesDB from "../QuotesDB/QuotesDB";
import { INTERVAL_IN_SECONDS } from "../BrokerManagers/BrokerManager.types";
import { Subscription, DataToPass, logger } from "./BinanceSocket";

export class BacktestingPriceStream {
  startDate: Date;
  currentDate: Date;
  endDate: Date;
  interval: number;
  subscriptions: Subscription[] = [];
  brokerManager: any;
  db: any;
  binanceMainClient: any;
  quotes_db: QuotesDB;
  timeOut: any;

  constructor(
    startDate: Date,
    endDate: Date,
    interval: number,
    db: any,
    binanceMainClient: any,
    brokerManager: any
  ) {
    this.currentDate = new Date(startDate);
    this.endDate = endDate;
    this.interval = interval;
    this.brokerManager = brokerManager;
    this.db = db;
    this.binanceMainClient = binanceMainClient;
  }

  async generateData() {
    if (!this.quotes_db)
      this.quotes_db = new QuotesDB(this.binanceMainClient, this.db);

    for (let s of this.subscriptions) {
      const data = await this.quotes_db.getQuote(
        s.ticker,
        s.interval,
        this.currentDate
      );
      if (data) {
        const dataToPassDown: DataToPass = {
          e: "kline",
          E: data.opentime.getTime(),
          s: data.ticker,
          k: {
            t: data.opentime.getTime(),
            c: data.priceC,
            o: data.priceO,
            h: data.priceH,
            l: data.priceL,
            v: data.volume,
            q: "0",
            i: s.interval,
            x: true,
          },
          wsMarket: "spot",
          wsKey: "spot_kline_" + data.ticker.toLowerCase() + "_" + s.interval,
        };

        this.onData(dataToPassDown);
      }
    }

    this.currentDate.setTime(this.currentDate.getTime() + this.interval * 1000);
    if (this.currentDate < this.endDate)
      this.timeOut = setImmediate(this.generateData.bind(this));
    else this.brokerManager.finish();
  }

  subscribeTicker(
    ticker: string,
    interval: keyof IntervalInSeconds,
    handler: Function
  ) {
    logger.log("Adding subscription to ", ticker);
    this.subscriptions.push({
      ticker: ticker,
      interval: interval,
      handler: [handler],
      ws: undefined,
    });
    this.interval = INTERVAL_IN_SECONDS[interval];
    this.generateData();
  }

  onData(data: DataToPass) {
    logger.log("Got Data ");
    this.subscriptions.forEach((a) => {
      if (a.handler) a.handler.forEach((h) => h(data));
    });
  }

  close() {
    clearTimeout(this.timeOut);
  }
}
