import { JsonScalar } from "./schema";
export const resolvers = {
    Json: JsonScalar,
    Query: {
      allJobs: async (obj, args, ctx) => {
        console.log(typeof ctx)
        return ctx.prisma.BacktestingJobs.findMany();
      }
    }
  };
