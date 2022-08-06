import {gql} from 'apollo-server-fastify'
import  { GraphQLScalarType } from 'graphql';

export const JsonScalar= new GraphQLScalarType({
  name: 'Json',
  description: 'JSON type',
  serialize(value) {
    return value //JSON.stringify(value); // Convert outgoing JSON to string or leave it as JSON?
  },
  parseValue(value) {
    return JSON.parse(value); // Convert incoming string to JSON // Needed sometimes?
  },
  parseLiteral(ast) {
    return JSON.parse(ast.value); // Convert hard-coded AST string to JSON? This is not needed
  },
});


export const typeDefs = gql`
  scalar Json 

  type BacktestingJobs {
    id: String
    JobStatus: String
    resultTrades: Json
    resultPortfolio: Json
  }

  type Query {
    allJobs: [BacktestingJobs!]!
  }
`;