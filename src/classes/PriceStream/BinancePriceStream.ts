import { WebsocketClient } from "binance";
import { Subscription, logger } from "./BinanceSocket";

class BinancePriceStream {
    private static instance: BinancePriceStream;
    private subscriptions: Subscription[] = [];
    private client: any;

    private constructor() {
        const apiKey = process.env["API_KEY"];
        const apiSecret = process.env["API_SECRET"];

        const wsClient = new WebsocketClient(
            {
                api_key: apiKey,
                api_secret: apiSecret,
                beautify: true,
            },
            logger
        );

        this.client = wsClient;
        wsClient.on("message", this.onData.bind(this));
    }

    static getInstance() {
        if (!this.instance) this.instance = new BinancePriceStream();
        return this.instance;
    }

    subscribeTicker(ticker: string, interval: string, handler: Function) {
        logger.log("Adding subscription to ", ticker);
        const element = this.subscriptions.find((s) => s.ticker == ticker);
        if (element) {
            logger.log(
                "Trying to add subscription that already exists, adding extra handler"
            );
            element.handler.push(handler);
            return;
        }

        const ws = this.client.subscribeKlines(ticker, interval, "spot"); // Klines market
        this.subscriptions.push({
            ticker: ticker,
            interval: interval,
            handler: [handler],
            ws: ws,
        });
    }

    onData(data: any) {
        logger.log("Got Data ");
        this.subscriptions.forEach((a) => {
            if (a.ticker == data.s && a.handler) a.handler.forEach((h) => h(data));
        });
    }

    close() {
        logger.log("Closing binancePriceStream");
        this.subscriptions.forEach((a) => {
            logger.log("Closing Subscription to ", a.ticker);
            this.client.closeWs(a.ws, false);
            logger.log(this.client.closeWs);
        });
    }
}
const binancePriceStream = BinancePriceStream.getInstance();
export { binancePriceStream };
