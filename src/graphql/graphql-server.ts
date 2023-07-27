/// ??????????????????????
/// ??????????????????????

import { ApolloServer } from "apollo-server-fastify";

import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";
import http from "http";

function fastifyAppClosePlugin(app) {
  return {
    async serverWillStart() {
      return {
        async drainServer() {
          await app.close();
        },
      };
    },
  };
}

export async function startApolloServerFastify(
  fast,
  typeDefs,
  resolvers,
  context
) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: "bounded",
    plugins: [
      fastifyAppClosePlugin(fast),
      ApolloServerPluginDrainHttpServer({ httpServer: fast.server }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
    context: context,
  });

  await server.start();
  fast.register(server.createHandler({ path: "/gql" }));
  return server;
}

export async function startApolloServerExpress(app, typeDefs, resolvers) {
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: "bounded",
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });
  await server.start();
  server.applyMiddleware({ app });
  return httpServer;
}
