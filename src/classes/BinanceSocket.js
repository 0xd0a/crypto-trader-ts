class BinanceSocket {
    constructor(host, customOnOpen, customOnMessage, customOnClose) {
        this.host = host;
        this.socketConnected = false;
        this.status = "connecting";
        // onopen function
        if (customOnOpen) this.onOpenCallback = customOnOpen;
        else this.onOpenCallback = function (msg) { console.log("BinanceSocket > default onopen"); };
        // onmessage function
        if (customOnMessage) this.onMessageCallback = customOnMessage;
        else this.onMessageCallback = function (msg) { console.log("BinanceSocket > default onmessage: " + msg.data); };
        // onclose function
        if (customOnClose) this.onCloseCallback = customOnClose;
        else this.onCloseCallback = function (event) { console.log("BinanceSocket > disconnected - event.code: " + event.code + ", reason: " + event.reason); };
        // start the websocket
        try {
            this.websocket = new WebSocket(host);
            // set a custom on open callback
            this.websocket.onOpenCallback = this.onOpenCallback;
            this.websocket.onopen = function (msg) {
                console.log("BinanceSocket > welcome - status: " + this.readyState);
                this.socketConnected = true;
                this.status = "connected";
                // call the onopen callback
                this.websocket.onOpenCallback();
            };
            // set an onmessage callback
            this.websocket.onmessage = this.onMessageCallback;
            // set an onclose callback
            this.websocket.onCloseCallback = this.onCloseCallback;
            this.websocket.onclose = function (event) {
                console.log("BinanceSocket > closed");
                this.socketConnected = false;
                this.status = "closed";
                // call the onclose callback
                this.websocket.onCloseCallback();
            }
            // set an onerror function
            this.websocket.onerror = function (event) {
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

    reconnect() {
        try {
            this.websocket = new WebSocket(this.host);
            console.log("BinanceSocket > status: " + this.websocket.readyState);
            // set a custom on open callback
            this.websocket.onOpenCallback = this.onOpenCallback;
            this.websocket.onopen = function (msg) {
                console.log("BinanceSocket > welcome - status: " + this.readyState);
                this.socketConnected = true;
                this.status = "connected";
                // call the onopen callback
                this.websocket.onOpenCallback();
            };
            // set an onmessage callback
            this.websocket.onmessage = this.onMessageCallback;
            // set an onclose callback
            this.websocket.onCloseCallback = this.onCloseCallback;
            this.websocket.onclose = function (event) {
                console.log("BinanceSocket > closed");
                this.socketConnected = false;
                this.status = "closed";
                // call the onclose callback
                this.websocket.onCloseCallback();
            }
            // set an onerror function
            this.websocket.onerror = function (event) {
                console.log("BinanceSocket > error");
                this.socketConnected = false;
                this.status = "error";
            };
        }
        catch (ex) {
            console.log("BinanceSocket > exception: " + ex);
            this.socketConnected = false;
        }
    }

    close() {
        this.websocket.close();
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
        this.websocket.onerror = function (event) {
            this.socketConnected = false;
            this.status = "error";
            this.websocket.onErrorCallback(event);
        };
    }
}


export class CandlestickStream {
    constructor(symbol, interval, handler) {
        this.symbol = symbol;
        this.interval = interval;
        this.handler = handler;
        this.webSocketConnected = false;
        this.webSocketHost = "wss://stream.binance.com:9443/ws/" + this.symbol + "@kline_" + this.interval;
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
    
    start() {
        // get a few recent candlesticks before starting the stream
        fetch("GET", "https://api.binance.com/api/v3/klines?symbol=" + this.symbol.toUpperCase() + "&interval=" + this.interval + "&limit=500")
        .then(this.checkStatus)
        .then(this.parseJson)
        .then((json)=>{
            json.forEach(e => {
                this.handler.onData(e[0], e[1], e[2], e[3], e[4]);
            });

            if (!this.webSocketConnected) {
                this.webSocket = new BinanceSocket(this.webSocketHost, this.onOpen, this.onMessage, this.onClose);
                this.webSocket.setOnErrorCallback(this.onWebSocketError);
            }
        })
        .catch((e)=> {
            console.log("error while requesting data from binance klines");
        }
        )
    }

    close() {
        this.webSocket.close();
    }

    onOpen() {
        this.webSocketConnected = true;
        console.log("websocket connected");
    }

    onMessage(msg) {
        var json = JSON.parse(msg.data);
        var cs = json.k;
        this.handler.onData(cs.t, cs.o, cs.h, cs.l, cs.c);
    }

    onClose() {
        if (this.webSocketConnected) {
            this.webSocketConnected = false;
            console.log("websocket closed");
        }
    }

    onWebSocketError(event) {
        this.webSocketConnected = false;
        console.log("custom websocket error function:");
        console.log(event);
    }
}