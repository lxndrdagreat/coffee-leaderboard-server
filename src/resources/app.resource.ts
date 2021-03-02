import { AppAuthRequestModel } from '../schemas/user-app-token.schema';
import {
  confirmServiceAuth,
  getUserByAppToken,
  UserNotFoundError
} from '../services/user-profile.service';
import { LogRequestModel } from '../schemas/log-request.model';
import { createEntry } from '../services/entry.service';
import { FastifyInstance } from 'fastify';

export default (server: FastifyInstance) => {
  /**
   * Handle authorizing apps
   */
  server.post('/api/app/auth', async (request, reply) => {
    const payload = request.body as AppAuthRequestModel;

    if (!payload.token || !payload.app || !payload.serviceName) {
      return reply.code(400).send('Invalid request.');
    }

    try {
      const [{ userName }, { appToken }] = await confirmServiceAuth(payload);
      return {
        token: appToken,
        userName: userName
      };
    } catch (e) {
      return reply.code(400).send(e);
    }
  });

  /**
   * App-based logging
   */
  server.post('/api/app/log', async (request, reply) => {
    const payload = request.body as LogRequestModel;
    if (!payload.token || !payload.message) {
      return reply.code(400).send('Invalid request.');
    }

    try {
      const result = await getUserByAppToken(payload.token);
      await createEntry(result._id, {
        type: 'app',
        text: payload.message,
        app: result.app
      });

      // TODO: outbound message to Slack Bot

      return 'ok';
    } catch (e) {
      if (e instanceof UserNotFoundError) {
        return reply.code(400).send('User not found.');
      }
      return reply.code(400).send(e);
    }
  });
};
