
export default class Candle {
    // priceO=0
    // priceH=0
    // priceL=0
    // priceC=0
    // volume=0
    // timeframe=1
    // opentime=new Date()
    constructor ({priceO=0,priceH=0,priceL=0,priceC=0,volume=0,timeframe=1,opentime=new Date()}) {
        this.priceO=priceO
        this.priceH=priceH
        this.priceL=priceL
        this.priceC=priceC
        this.volume=volume
        this.timeframe=timeframe
        this.opentime=opentime

    }
}