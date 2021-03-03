import * as config from './config/config';
import Fastify, { FastifyInstance } from 'fastify';
import rawBody from 'fastify-raw-body';
import formBody from 'fastify-formbody';
import webhooksApi from './resources/webhook.resource';
import appApi from './resources/app.resource';
import leaderboardApi from './resources/leaderboard.resource';

const server: FastifyInstance = Fastify({ logger: true });

server.register(formBody);
server.register(rawBody, {
  global: false,
  runFirst: true
});

webhooksApi(server);
appApi(server);
leaderboardApi(server);

const start = async () => {
  try {
    await server.listen(config.serverPort, '0.0.0.0');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
