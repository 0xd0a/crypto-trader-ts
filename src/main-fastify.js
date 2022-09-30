
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
import { WebSocketServer } from './websocket-server'
import mercurius from 'mercurius'
import { resolvers } from './graphql/resolvers'
import {typeDefs} from './graphql/schema'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { startApolloServerFastify } from './graphql/graphql-server'
import { start } from 'repl'

const prisma = new PrismaClient()

const fastify = Fastify({
  logger: true
})
const Server = startApolloServerFastify(fastify, typeDefs, resolvers, {prisma:prisma})


// fastify.register(mercurius, {
//   schema: makeExecutableSchema({ typeDefs: schema, resolvers: resolvers }),
//   context: (request, reply) => {
//     // Return an object that will be available in your GraphQL resolvers
//     return {
//         asdf: {prisma:prisma}
//     }
//   }
//   })


const webSocketServer=new WebSocketServer()

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

      var trId = jobQueue.enqueue(tr.run.bind(tr),tr.result.bind(tr),prisma,config)

      await prisma.BacktestingJobs.create({
        data: {
        id:trId,
        JobStarted:new Date(),
        JobFinished:null,
        JobStatus:"running",
        params: config
        }
      })
      reply.send({id:trId})
      //return {id:trId}
    })

    fastify.get('/TraderResult/:id', async (request, reply) => {
      var result = jobQueue.getItem( request.params.id )
      reply.send(result)
      //return result  //{id:request.params.id,result:result}
    })

    // fastify.get('/api', async function (req, reply) {
    //   const query = '{ allJobs {id } }'
    //   return reply.graphql(query)
    // })
    
    try {
      await Server.then(s=>fastify.listen({ port: 3001 }))
      console.log("after fastify")
    } catch (err) {
      console.error("Error ",err)
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