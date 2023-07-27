import { JsonScalar } from "./schema";
export const resolvers = {
  Json: JsonScalar,
  Query: {
    allJobs: async (obj, args, ctx) => {
      console.log(typeof ctx);
      return ctx.prisma.BacktestingJobs.findMany();
    },
    getQuote: async (obj, args, ctx) => {
      console.log(new Date(args.endDate * 1000).toISOString());
      return ctx.prisma.Quotes.findMany({
        where: {
          ticker: args.ticker,
          opentime: {
            gte: new Date(args.startDate),
            lte: new Date(args.endDate * 1000),
          },
        },
        take: 100,
      });
    },
  },
};
