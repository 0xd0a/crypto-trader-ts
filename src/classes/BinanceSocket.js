`use strict`

import fetch from 'isomorphic-fetch'
import { resolve } from 'url';
import WebSocket from 'ws'


// TODO: make an async wrapper around WebSocket
class BinanceSocket {
    constructor(host, handlerClass) { //, customOnOpen, customOnMessage, customOnClose) {
        this.host = host;
        this.socketConnected = false;
        this.status = "connecting";
        this.handlerClass=handlerClass
        // onopen function
        if (this.handlerClass?.onOpen) this.onOpenCallback = this.handlerClass?.onOpen.bind(this.handlerClass)
        else this.onOpenCallback = function (msg) { console.log("BinanceSocket > default onopen"); };
        // onmessage function
        if (this.handlerClass?.onMessage) this.onMessageCallback = this.handlerClass?.onMessage.bind(this.handlerClass);
        else this.onMessageCallback = function (msg) { console.log("BinanceSocket > default onmessage: " + msg.data); };
        // onclose function
        if (this.handlerClass?.onClose) this.onCloseCallback = this.handlerClass?.onClose.bind(this.handlerClass)
        else this.onCloseCallback = function (event) { console.log("BinanceSocket > disconnected - event.code: " + event.code + ", reason: " + event.reason); };
        // start the websocket
        try {
            this.websocket = new WebSocket(host);
            // set a custom on open callback
            this.websocket.onOpenCallback = this.onOpenCallback;
            this.websocket.onopen =  (msg) => {
                console.log("BinanceSocket > welcome - status: " + this.readyState);
                this.socketConnected = true;
                this.status = "connected";
                console.log(this.onOpenCallback);
                // call the onopen callback
                this.websocket.onOpenCallback();
            };
            // set an onmessage callback
            this.websocket.onmessage = this.onMessageCallback;
            // set an onclose callback
            this.websocket.onCloseCallback = this.onCloseCallback;
            this.websocket.onclose = async (event) => {
                console.log("BinanceSocket:: closed");
                this.socketConnected = false;
                this.status = "closed";
                // call the onclose callback
                this.websocket.onCloseCallback();
            }
            // set an onerror function
            this.websocket.onerror =  (event) => {
                console.log("BinanceSocket > error");
                this.socketConnected = false;
                this.status = "error";
            };
        }
        catch (ex) {
            console.log("BinanceSocket > exception: " + ex);
            this.status = "error";
        }
    }

    async close() {
        await this.websocket.close();
    }

    send(str) {
        try {
            this.websocket.send(str);
        }
        catch (ex) {
            console.log("BinanceSocket > send > exception: " + ex);
        }
    }

    isConnected() {
        return this.socketConnected;
    }

    getStatus() {
        return this.status;
    }

    getSocket() {
        return this.websocket;
    }

    setOnErrorCallback(onErrorCallback) {
        // set an onerror function
        this.websocket.onErrorCallback = onErrorCallback;
        this.websocket.onerror =  (event) => {
            this.socketConnected = false;
            this.status = "error";
            this.websocket.onErrorCallback(event);
        };
    }
}

class BinanceStream {
    constructor () {}

    start() {
        // get a few recent values before starting the stream
        if(this.url!= "") 
            fetch("GET", this.url)
            .then(this.checkStatus)
            .then(this.parseJson)
            .then((json)=>{
                json.forEach(e => {
                    this.handler.initData(e); // initial Data 
                });

            })
            .catch((e)=> {
                console.log("BinanceStream::start error while requesting data from binance ", this.url);
            }
            )
        if (!this.webSocketConnected) {
            //this.binanceWebSocket = new BinanceSocket(this.webSocketHost, this);
            this.binanceWebSocket = new WebSocket(this.webSocketHost, this);
            this.binanceWebSocket.onerror=this.onWebSocketError.bind(this);
            
            this.binanceWebSocket.onopen =  (msg) => {
                console.log("BinanceSocket > welcome - status: " + this.readyState);
                this.socketConnected = true;
                this.status = "connected";
                console.log(this.onOpenCallback);
                // call the onopen callback
                this.binanceWebSocket.onOpenCallback();
            };
            // set an onmessage callback
            this.binanceWebSocket.onmessage = this.onMessage.bind(this);
            // set an onclose callback
            this.binanceWebSocket.onCloseCallback = this.onClose.bind(this);
            this.binanceWebSocket.onclose = async (event) => {
                console.log("BinanceSocket:: closed");
                this.socketConnected = false;
                this.status = "closed";
                // call the onclose callback
                this.binanceWebSocket.onCloseCallback();
            }
            // set an onerror function
            this.binanceWebSocket.onerror =  (event) => {
                console.log("BinanceSocket > error");
                this.socketConnected = false;
                this.status = "error";
            };
        }
    }

    checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
          return Promise.resolve(response)
        } else {
          return Promise.reject(new Error(response.statusText))
        }
      }
      
    parseJson(response) {
        return response.json()
    }

    async close() {
        const pr=new Promise((r,e)=> {this.res=()=>{r(true)}})
        await this.binanceWebSocket.close();
        await this.binanceWebSocket.onCloseCallback(this.res)
        console.log("Now waiting for promise",this.res)
        return pr
    }

    onOpen() {
        this.webSocketConnected = true;
        console.log("websocket connected");
    }

    onMessage(msg) {
        var json = JSON.parse(msg.data);
        //var cs = json.k;
        //console.log(this)
        this.handler.onData(json); // real Data
    }

    onClose(pr) {
        console.log("This is Stream::onClose with ",pr)
        if (this.webSocketConnected) {
            this.webSocketConnected = false;
            console.log("websocket closed");
        }
        console.log("Trying to resolve")
        //pr(true);
        console.log("End trying to resolve")
    }

    onWebSocketError(event) {
        // Connection is only valid for 24 hours so make sure to reconnect in this function
        this.webSocketConnected = false;
        console.log("custom websocket error function:");
        console.log(event);
    }
}

export class CandlestickStream extends BinanceStream {
    constructor(symbol, interval, handler) {
        this.symbol = symbol;
        this.interval = interval;
        this.handler = handler; // has to implement onData(data)
        this.webSocketConnected = false;
        this.webSocketHost = "wss://stream.binance.com:9443/ws/" + this.symbol + "@kline_" + this.interval;
        this.url="https://api.binance.com/api/v3/klines?symbol=" + this.symbol.toUpperCase() + "&interval=" + this.interval + "&limit=500";
        this.start()
    }

}

export class MiniTickerStream extends BinanceStream {
    constructor(symbol, handler) {
        super()
        this.symbol = symbol;
        this.interval = interval;
        this.handler = handler; // has to implement onData(data)
        this.webSocketConnected = false;
        this.webSocketHost = "wss://stream.binance.com:9443/ws/" + this.symbol + "@miniTicker";
        this.url="https://api.binance.com/api/v3/miniTicker?symbol=" + this.symbol.toUpperCase() + "&interval=" + this.interval + "&limit=500";
        this.start()
    }

}

export class AllTickerStream extends BinanceStream {
    constructor(symbol, interval, handler) {
        super()
        this.symbol = symbol;
        this.interval = interval;
        this.handler = handler; // has to implement onData(data)
        this.webSocketConnected = false;
        this.webSocketHost = "wss://stream.binance.com:9443/ws/!miniTicker@arr";
        this.url="" //"https://api.binance.com/api/v3/avgPrice?symbol=" + this.symbol.toUpperCase() ;
        this.start()
    }
}

class BinanceStreamCollection {

    constructor () {
        this.streams=[]
    }
    static getInstance() {
        if (!this.instance) 
            this.instance=new BinanceStreamCollection()
        return this.instance
    }
    openStream(stream) {
        this.streams.push(stream);
    }

    closeStream(stream) {
        this.streams.find(e => {e==stream})?.close()
    }

    async closeAll () {
        //this.streams.forEach(async s=>{await s.close()})
        console.log("Starting to close")
        await this.streams[0].close()
        console.log("Still waiting")
        //return Promise.resolve(true)
    }
}
const streamCollection = BinanceStreamCollection.getInstance();

export {streamCollection};