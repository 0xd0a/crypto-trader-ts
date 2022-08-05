# A one crypto bot platform to rule them all ₿👋

This is a very simple :smiley: yet modular platform to run and test crypto (though not only crypto) bots.

* The platform provides various tools and interfaces for trading Strategies like receiving price streams, executing and logging trades, etc.

* An environment of your preference: a server with API or a standalone CLI.

Here's a basic Strategy:
~~~
export class Strategy {
    setBrokerManager(brokerManager) {
        this.brokerManager=brokerManager
    }
    setTrader(trader) {
        this.trader=trader
    }
    init() {
        // Subscribe to market data (will be fed both live and historic data)
        this.brokerManager.subscribeTicker('ETHUSDT',this.onData.bind(this))
    }
    onData(data) {
        // data is an market frame data 
        console.log("Strategy Receiving data "," ",data.s)
    }
    onInitData(data) {
        // data is warmup data
        console.log("Receiving init data", data)
    }
}
~~~

The architecture is built such that Strategy is a plug-n-play standalone class that is guaranteed:
1) Live/Backtesting agnostic environment (the same code for live or backtesting data)
2) Data is fed in regular intervals
3) The general logic is executed in onData() callback. It receives whatever the strategy subscribed to (usually a single price stream) and then makes decisions on trades using indicators.

## Installation
Install all the packages
~~~
npm i
~~~

Initialize Prisma
~~~
npx prisma migrate dev
~~~

Start your favorite mariadb and phpmyadmin (http://localhost:8081)
~~~
cd docker && docker-compose up -d
~~~

3...2...1...
~~~
npm start
~~~

## Working with resulting data
### Visualize with a frontend
### Log and save to JSON