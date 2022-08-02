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
        this.brokerManager.subscribeTicker('BNBUSDT',this.onData.bind(this))
    }
    onData(data) {
        this.i++

        if(!this.reverted_position && data.c<this.buy_price) 
            this.brokerManager.trade('USDT', 'BNB', 1, data.c, data.E)
            .then(a=>{
                this.reverted_position=true
                this.buy_price=data.c
                console.log("First trade was ",a)
            })

        if(data.c>this.buy_price*1.02 && this.reverted_position==true) 
            this.brokerManager.trade('BNB', 'USDT', data.c, 1/data.c, data.E)
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
