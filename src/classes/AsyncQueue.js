
// Since API request only lasts seconds and trader can run for a very long time 
// we have to create a class that will handle background jobs.
//  
// Run Trader class in the background

import { finished } from "stream";
import { genHexId } from "../utils/util";
export class AsyncQueue  {
    constructor() {
        this.items=[]
    }

    enqueue(action, resultcallback, dbclient, params) {
        const id=genHexId(12)
        this.db=dbclient
        var n=this.items.push({id: id, 
                action:action, 
                resultcallback:resultcallback,
                params:params, 
                result:null
            })-1
        this.dequeue(id);
        return id
    }

    getItem(id) {
        return this.items.find(a=>a.id==id)
    }

    async dequeue(id) {
        let item=this.getItem(id)

        if (!item) return false;

        try {
            const JobStarted=new Date()
            let result = await item.action(item.params)
            const JobFinished=new Date()
            var results=item.resultcallback()
            // Could be a callback too
            await this.db.BacktestingJobs.update({
                where: {
                  id: id
                },
                data:{
                  JobStatus:"finished",
                  JobStarted: JobStarted,
                  JobFinished: JobFinished,
                  resultTrades:results.tradelog,
                  resultPortfolio:results.portfolio
                }
              }
            )
            // put result back to the array
            item.result={error:false,JobStart:JobStarted,JobFinish:JobFinished,result:results};
        } catch (e) {console.log()
            console.log(e)
            await this.db.BacktestingJobs.update({
                where: {
                  id: id
                },
                data:{
                    JobStatus:"error"
                }
            })

            item.result={error:true,result:results,error:e}
        }

        return true;
    }
}
