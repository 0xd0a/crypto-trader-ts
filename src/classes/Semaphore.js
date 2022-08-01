export default class Semaphore {
    constructor() {
        this.locked=false
        this.resolve=null
    }  

    unlock() {
        this.locked=false
        if(typeof this.resolve == "function")
            this.resolve()
    }

    async lock() {
        if(!this.locked)
        {
            this.locked=true
            this.promise= new Promise(r=>this.resolve=r)
        }
        else
            await this.promise
    }

    check() {
        return this.locked
    }

}