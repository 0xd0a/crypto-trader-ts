import { connect } from 'it-ws'
import { pipe } from 'it-pipe'

test("Test pipe", async ()=>{

    const stream = connect(WS_URL)

    await stream.connected() // Wait for websocket to be connected (optional)

    pipe(source, stream, sink)

})