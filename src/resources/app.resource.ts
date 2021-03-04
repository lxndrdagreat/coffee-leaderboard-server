import { AppAuthRequestModel } from '../schemas/user-app-token.schema';
import {
  confirmServiceAuth,
  validateUserAppToken,
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

    if (!payload.serviceToken || !payload.app || !payload.serviceName) {
      return reply.code(400).send('Invalid request.');
    }

    try {
      const [{ _id, userName }, { appToken }] = await confirmServiceAuth(
        payload
      );
      return {
        appToken: appToken,
        user: {
          userId: _id.toHexString(),
          userName: userName
        }
      };
    } catch (e) {
      return reply.code(400).send(e);
    }
  });

  /**
   * App-based logging
   */
  server.post('/api/app/log', async (request, reply) => {
    // require token
    if (
      !request.headers.hasOwnProperty('x-leaderboard-token') ||
      !request.headers.hasOwnProperty('x-leaderboard-app')
    ) {
      return reply.code(401).send('Unauthorized');
    }
    const appToken = request.headers['x-leaderboard-token'] as string;
    const appName = request.headers['x-leaderboard-app'] as string;

    // validate payload
    const payload = request.body as LogRequestModel;
    if (!payload.message) {
      return reply.code(400).send('Invalid request.');
    }

    try {
      const [user, appInfo] = await validateUserAppToken(appToken, appName);
      await createEntry(user._id, {
        type: 'app',
        text: payload.message,
        app: appInfo.app ?? ''
      });

      // TODO: outbound message to Slack Bot to post in the Slack channel

      return 'ok';
    } catch (e) {
      if (e instanceof UserNotFoundError) {
        return reply.code(400).send('User not found.');
      }
      return reply.code(400).send(e);
    }
  });
};
