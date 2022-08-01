import 'dotenv/config'
import fs from 'fs'
import { Spot } from '@binance/connector'
import {Console} from 'console'
import LiveBrokerManager from './classes/BrokerManager'
import { PrismaClient } from '@prisma/client'
import { streamCollection } from './classes/BinanceSocket'
import Trader, { traderCollection } from './classes/Trader'
import { Strategy, Strategy2 } from './classes/Strategy'

const prisma = new PrismaClient()

const output = fs.createWriteStream('./logs/stdout.log')
const errorOutput = fs.createWriteStream('./logs/stderr.log')

const lggr = new Console({ stdout: output, stderr: errorOutput })
var loopresolver

const tr=new Trader({traderType:"LIVE",db:prisma,logger:lggr,strategy:new Strategy()});
const tr2=new Trader({traderType:"LIVE",db:prisma,logger:lggr,strategy:new Strategy2()});

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");

  traderCollection.terminate();
  loopresolver()
  
});

async function main () {
    //const o=await BM.getCurrentPrice('ETHUSDT'
    const loop=new Promise(r=>{loopresolver=r})

    await traderCollection.run()
    traderCollection.terminate()

    //await loop
    console.log("END OF MAIN");
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log("Closing all streams")
    
    //streamCollection.closeAll()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
  
  
// // Get account information
// client.account().then(response => client.logger.log(response.data))

// // Place a new order
// client.newOrder('BNBUSDT', 'BUY', 'LIMIT', {
//   price: '350',
//   quantity: 1,
//   timeInForce: 'GTC'
// }).then(response => client.logger.log(response.data))
//   .catch(error => client.logger.error(error))
