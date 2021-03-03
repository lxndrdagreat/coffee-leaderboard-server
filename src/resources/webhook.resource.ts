import { FastifyInstance } from 'fastify';
import { requireSlackAuth } from '../services/slack.service';
import {
  SlackCreateAppAuthRequestBody,
  SlackEventBase,
  SlackEventBody,
  SlackEventUrlVerificationBody
} from '../schemas/slack.schema';
import {
  createServiceAuth,
  getOrCreateUserForSlackId,
  getUserByUsername
} from '../services/user-profile.service';
import { slackChannelIds } from '../config/config';
import { createEntry } from '../services/entry.service';

export default (server: FastifyInstance) => {
  server.post('/api/webhooks/slack/event', {
    config: {
      rawBody: true
    },
    handler: async (request, reply) => {
      const payload = request.body as SlackEventBody;
      if (!payload.type || !payload.token) {
        return reply.code(403).send('Unauthorized');
      }

      try {
        requireSlackAuth(request);
      } catch (e) {
        return reply.code(403).send();
      }

      if (payload.type === 'url_verification') {
        const { challenge } = payload as SlackEventUrlVerificationBody;
        if (!challenge) {
          return reply.code(403).send('Unauthorized');
        }
        return {
          challenge
        };
      } else if (payload.type === 'event_callback') {
        const { event } = payload as SlackEventBase;

        // Must be a message with the text starting with the :coffee: emoji
        if (
          event.type === 'message' &&
          event.channel_type === 'channel' &&
          slackChannelIds.includes(event.channel) &&
          event.text &&
          event.text.toLowerCase().trim().startsWith(':coffee:')
        ) {
          // find the user
          const user = await getOrCreateUserForSlackId(event.user);

          await createEntry(user._id, {
            type: 'slack',
            text: event.text,
            channel: {
              name: event.channel,
              id: event.channel
            }
          });
        }
      }

      return {};
    }
  });

  server.post('/api/webhooks/slack/create-auth', {
    config: {
      rawBody: true
    },
    handler: async (request, reply) => {
      // validation
      try {
        requireSlackAuth(request);
      } catch (e) {
        return reply.code(401).send();
      }

      const body = request.body as SlackCreateAppAuthRequestBody;
      if (!body.user_name) {
        return reply.code(401).send();
      }

      try {
        // TODO: maybe allow "getOrCreateUser"?
        const user = await getUserByUsername(body.user_name);
        const [, app] = await createServiceAuth(user._id, 'slack');
        return reply.type('application/json').send({
          // only show to the user who talked to the bot
          response_type: 'ephemeral',
          text:
            'Copy/paste this authentication token into the Coffee Leaderboard App:',
          attachments: [
            {
              text: app.serviceToken
            }
          ]
        });
      } catch (e) {
        server.log.error(e);
        return reply.code(400).send();
      }
    }
  });
};
