import { getLeaderboard } from '../services/leaderboard.service';
import { FastifyInstance } from 'fastify';
import { requireAppAuthMiddleware } from '../middleware/require-app-auth.middleware';

export default (server: FastifyInstance) => {
  server.get('/api/leaderboard', async (request, reply) => {
    // TODO: move to middleware
    try {
      await requireAppAuthMiddleware(request);
    } catch (e) {
      return reply.code(403).send(e);
    }

    return await getLeaderboard();
  });
};
