
import 'dotenv/config'
import fs from 'fs'
import { Spot } from '@binance/connector'
import {Console} from 'console'
import LiveBrokerManager from './classes/BrokerManager'
import { PrismaClient } from '@prisma/client'
import { streamCollection } from './classes/BinanceSocket'
import Trader, { traderCollection } from './classes/Trader'
import { Strategy, Strategy2 } from './classes/Strategy'
import { MainClient } from 'binance'
import { AsyncQueue } from './classes/AsyncQueue'
import Fastify from 'fastify'

const fastify = Fastify({
  logger: true
})

const prisma = new PrismaClient()
const binanceMainClient = new MainClient()

const output = fs.createWriteStream('./logs/stdout.log')
const errorOutput = fs.createWriteStream('./logs/stderr.log')

const lggr = new Console({ stdout: output, stderr: errorOutput })
var loopresolver

var jobQueue=new AsyncQueue()

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");

  traderCollection.terminate();
  loopresolver()

});

async function main () {
    const loop=new Promise(r=>{loopresolver=r})

    fastify.get('/TraderRun', async (request, reply) => {
      const startDate=new Date(2022,3,1,0,0,0)
      const endDate=new Date()
      endDate.setTime(startDate.getTime()+1440*60*1000)

      var config={
        startDate:startDate,
        endDate:endDate,
        interval:60
      }

      const tr=new Trader({traderType:"HISTORY",config:config, db:prisma,logger:lggr,strategy:new Strategy2(),binanceMainClient:binanceMainClient});
      var trId = jobQueue.enqueue(tr.run.bind(tr),tr.result.bind(tr),config)
      //await tr.run()
      return {id:trId}
    })

    fastify.get('/TraderResult/:id', async (request, reply) => {
      var result = jobQueue.getItem( request.params.id )
      
      return result  //{id:request.params.id,result:result}
    })

    try {
      await fastify.listen({ port: 3000 })
      console.log("after fastify")
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }

    await loop
    console.log("END OF MAIN");
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log("Closing all streams")
    process.exit()
    //streamCollection.closeAll()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })