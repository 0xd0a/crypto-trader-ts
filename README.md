# A simplistic nodejs crypto bot 👋

This is a very simple :smiley: yet modular platform to run and test crypto (not only crypto) bots.

The platform provides various tools and interfaces for trading Strategies like receiving price streams, executing and logging trades, etc.

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