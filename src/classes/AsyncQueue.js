
export class AsyncQueue  {
    constructor() {
        this.items=[]
    }

    enqueue(action, resultcallback, params) {
        var n=this.items.push({action:action, resultcallback:resultcallback, params:params, result:null})-1
        this.dequeue(n);
        return n 
    }

    getItem(n) {
        return this.items[n]
    }

    async dequeue(n) {
        let item=this.items[n]

        if (!item.action) return false;

        try {
            let result = await item.action(item.params)

            // put result back to the array
            this.items[n].result={error:false,result:item.resultcallback()};
        } catch (e) {
            this.items[n].result={error:true,result:result};;
        }

        return true;
    }
}
