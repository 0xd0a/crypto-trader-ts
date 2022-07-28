import {streamCollection, AllTickerStream} from '../src/classes/BinanceSocket.js'

class t {
  onData(e) {
    console.log("Data received ",new Date());
  }

  initData(e){
    console.log("Initial data ",e);
  }
}

const delay = ms => new Promise(res => setTimeout(res, ms));

test("Test BinanceStreams", async ()=>{
 
  const ats=new AllTickerStream('ETHUSDT','1m',new t())
  streamCollection.openStream(ats)
  await delay(4000)

  await streamCollection.closeAll()
  console.log("END OF RUN")
  await delay(1000) // really bad logic
 
})

