import { gql } from "apollo-server-fastify";
import { GraphQLScalarType } from "graphql";

import { Kind } from "graphql/language";

export const JsonScalar = new GraphQLScalarType({
  name: "Json",
  description: "JSON type",
  serialize(value) {
    return value; //JSON.stringify(value); // Convert outgoing JSON to string or leave it as JSON?
  },
  parseValue(value: unknown): unknown {
    return JSON.parse(value as string); // Convert incoming string to JSON // Needed sometimes?
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return JSON.parse(ast.value); // Convert hard-coded AST string to JSON? This is not needed
    }
  },
});

export const DateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  parseValue(value) {
    return new Date(value as string); // value from the client
  },
  serialize(value) {
    if (value instanceof Date) {
      return value.getTime(); // value sent to the client
    }
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // ast value is always in string format
    }
    return null;
  },
});

export const typeDefs = gql`
  scalar Json
  scalar Date

  type BacktestingJobs {
    id: String
    JobStatus: String
    resultTrades: Json
    resultPortfolio: Json
    JobStarted: Date
    JobFinished: Date
  }

  type Quotes {
    id: Int
    ticker: String
    opentime: Date
    priceO: Float
    priceH: Float
    priceL: Float
    priceC: Float
    volume: Float
  }

  type Query {
    allJobs: [BacktestingJobs!]!
    getQuote(ticker: String!, startDate: Int, endDate: Int): [Quotes!]!
  }

  #   type Subscription {
  #     InterServerOps: String
  #   }
`;
