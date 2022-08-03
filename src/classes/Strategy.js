import { kMaxLength } from "buffer"
import { binancePriceStream } from "./BinanceSocket"
import { Interval } from "./BrokerManager"
export class Strategy {
    i=0
    constructor() {
        this.last=null
        //binancePriceStream.subscribeTicker('ETHUSDT',this.onData.bind(this))
    }
    setBrokerManager(brokerManager) {
        this.brokerManager=brokerManager
    }
    setTrader(trader) {
        this.trader=trader
    }
    init() { //one should subscribe to the same interval, not combined but have to sync streams
        this.brokerManager.subscribeTicker('ETHUSDT',Interval.Minute, this.onData.bind(this))
        this.brokerManager.subscribeTicker('BTCUSDT',Interval.Minute, this.onData.bind(this))
    }
    onData(data) {
        if(data.e=='kline') {
            if(this.last?.k?.t!=data?.k?.t) {
                this.last=data
                return
            }
        }

        this.i++
//        if(this.i>3) this.trader.terminate()
        console.log("Strategy Receiving data ", this.i," ",data)
    }

    onInitData(data) {
        console.log("Receiving init data", data)
    }
}

export class Strategy2 {
    i=0
    reverted_position=false
    buy_price=10000000
    constructor() {
        //binancePriceStream.subscribeTicker('BNBUSDT',this.onData.bind(this))
    }
    setBrokerManager(brokerManager) {
        this.brokerManager=brokerManager
    }
    setTrader(trader) {
        this.trader=trader
    }
    init() {
        this.brokerManager.subscribeTicker('BNBUSDT',Interval.FiveMinutes, this.onData.bind(this))
    }
    onData(data) {
        this.i++
        if(data.e=="kline")
            data=data.k
        if(!this.reverted_position && data.c<this.buy_price) 
            this.brokerManager.trade('BUY','USDT', 'BNB', 1, data.c, data.t)
            .then(a=>{
                this.reverted_position=true
                this.buy_price=data.c
                console.log("First trade was ",a)
            })

        if(data.c>this.buy_price*1.02 && this.reverted_position==true) 
            this.brokerManager.trade('SELL','BNB', 'USDT', 1, data.c, data.t)
            .then(a=>{
                this.reverted_position=false
                console.log("Last trade was ",a)
            })
        
        console.log("Strategy2 Receiving data ",this.i," ", data)
    }

    onInitData(data) {
        console.log("Receiving2 init data", data)
    }
}
