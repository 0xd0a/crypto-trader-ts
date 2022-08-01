import { binancePriceStream } from "./BinanceSocket"

export class Strategy {
    i=0
    constructor() {
        //binancePriceStream.subscribeTicker('ETHUSDT',this.onData.bind(this))
    }
    setBrokerManager(brokerManager) {
        this.brokerManager=brokerManager
    }
    setTrader(trader) {
        this.trader=trader
    }
    init() {
        this.brokerManager.subscribeTicker('ETHUSDT',this.onData.bind(this))
    }
    onData(data) {
        this.i++
        if(this.i>3) this.trader.terminate()
        console.log("Strategy Receiving data ", this.i," ",data.s)
    }

    onInitData(data) {
        console.log("Receiving init data", data)
    }
}

export class Strategy2 {
    i=0
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
        this.brokerManager.subscribeTicker('BNBUSDT',this.onData.bind(this))
    }
    onData(data) {
        this.i++
        if(this.i>5) this.trader.terminate()
        console.log("Strategy2 Receiving data ",this.i," ", data.s)
    }

    onInitData(data) {
        console.log("Receiving2 init data", data)
    }
}
