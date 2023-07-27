// // Since API request only lasts seconds and trader can run for a very long time
// // we have to create a class that will handle background jobs.
// //
// // Run Trader class in the background

// import { PrismaClient } from "@prisma/client";
// import { genHexId } from "../utils/util";

// type QueueItems = {
//     id: string,
//     action: string,
//     resultcallback: Function,
//     params: params,
//     result: null,
//   }
// export class AsyncQueue {
//   constructor(private items = [], private dbclient: PrismaClient ) {}

//   enqueue(action, resultcallback, params) {
//     const id = genHexId(12);
//     this.items.push({
//       id: id,
//       action: action,
//       resultcallback: resultcallback,
//       params: params,
//       result: null,
//     });
//     this.dequeue(id);
//     return id;
//   }

//   getItem(id: string) {
//     return this.items.find((a) => a.id == id);
//   }

//   async dequeue(id: string) {
//     let item = this.getItem(id);

//     if (!item) return false;

//     try {
//       const JobStarted = new Date();
//       let result = await item.action(item.params);
//       const JobFinished = new Date();
//       var results = item.resultcallback();
//       // Could be a callback too
//       await this.dbclient.BacktestingJobs.update({
//         where: {
//           id: id,
//         },
//         data: {
//           JobStatus: "finished",
//           JobStarted: JobStarted,
//           JobFinished: JobFinished,
//           resultTrades: results.tradelog,
//           resultPortfolio: results.portfolio,
//         },
//       });
//       // put result back to the array
//       item.result = {
//         error: false,
//         JobStart: JobStarted,
//         JobFinish: JobFinished,
//         result: results,
//       };
//     } catch (e) {
//       console.log();
//       console.log(e);
//       await this.dbclient.BacktestingJobs.update({
//         where: {
//           id: id,
//         },
//         data: {
//           JobStatus: "error",
//         },
//       });

//       item.result = { error: true, result: results, error: e };
//     }

//     return true;
//   }
// }


import { PrismaClient } from "@prisma/client";
import { genHexId } from "../utils/util";

interface JobParams {
  [key: string]: string; 
}

interface JobResults {
  tradelog: any;
  portfolio: any;
}

interface QueueItem<T extends JobParams, R extends JobResults> {
  id: string;
  action: (params: T) => Promise<R>;
  resultcallback: () => R;
  params: T;
  result: Result<R> | null;
}

interface Result<R extends JobResults> {
  error: boolean;
  JobStart?: Date;
  JobFinish?: Date;
  result?: R;
  err?: Error;
}

export class AsyncQueue<T extends JobParams, R extends JobResults> {
  private items: QueueItem<T, R>[] = [];

  constructor(private dbclient: PrismaClient) {}

  enqueue(action: (params: T) => Promise<R>, resultcallback: () => R, params: T): string {
    const id = genHexId(12);
    this.items.push({
      id,
      action,
      resultcallback,
      params,
      result: null,
    });
    this.dequeue(id);
    return id;
  }

  getItem(id: string): QueueItem<T, R> | undefined {
    return this.items.find((a) => a.id === id);
  }

  async dequeue(id: string): Promise<boolean> {
    let item = this.getItem(id);

    if (!item) return false;

    try {
      const JobStarted = new Date();
      let result = await item.action(item.params);
      const JobFinished = new Date();
      const results = item.resultcallback();

      await this.dbclient.BacktestingJobs.update({
        where: { id },
        data: {
          JobStatus: "finished",
          JobStarted,
          JobFinished,
          resultTrades: results.tradelog,
          resultPortfolio: results.portfolio,
        },
      });

      item.result = {
        error: false,
        JobStart: JobStarted,
        JobFinish: JobFinished,
        result: results,
      };
    } catch (e) {
      logger.error(e);
      await this.dbclient.BacktestingJobs.update({
        where: { id },
        data: {
          JobStatus: "error",
        },
      });

      item.result = { error: true, result: undefined, err: e };
      throw e;  // re-throw error after handling it
    }

    return true;
  }
}
