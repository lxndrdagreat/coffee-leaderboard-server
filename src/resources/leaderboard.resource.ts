import { getLeaderboard } from '../services/leaderboard.service';
import { FastifyInstance } from 'fastify';
import { validateUserAppToken } from '../services/user-profile.service';

export default (server: FastifyInstance) => {
  server.get('/api/leaderboard', async (request, reply) => {
    // TODO: move to middleware

    // require token
    if (
      !request.headers.hasOwnProperty('x-leaderboard-token') ||
      !request.headers.hasOwnProperty('x-leaderboard-app')
    ) {
      return reply.code(401).send('Unauthorized');
    }
    const appToken = request.headers['x-leaderboard-token'] as string;
    const appName = request.headers['x-leaderboard-app'] as string;

    try {
      await validateUserAppToken(appToken, appName);
    } catch (e) {
      return reply.code(401).send(e);
    }

    return await getLeaderboard();
  });
};
