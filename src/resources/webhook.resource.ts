import { FastifyInstance } from 'fastify';
import { requireSlackAuth } from '../services/slack.service';
import { SlackCreateAppAuthRequestBody } from '../schemas/slack.schema';
import {
  createServiceAuth,
  getUserByUsername
} from '../services/user-profile.service';

export default (server: FastifyInstance) => {
  // server.post(
  //   '/api/webhooks/slack/event',
  //   async (request, reply) => {
  //
  //   }
  // );

  /*
    console.log(context);

        const payload = context.body as SlackEventBody;

        // Only event being handled right now is url_verification needed to authorize the server
        if (payload.type === 'url_verification') {
          return DataResult.ok({
            value: {
              challenge: (payload as SlackEventUrlVerificationBody).challenge
            }
          });
        }

        return DataResult.ok();
     */

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

//     /**
//      * Handle :coffee: requests coming in from slack
//      */
//     data(
//       '/slack/log',
//       {
//         post: async (context: RouteContext) => {
//           const payload = context.body as SlackLogBody;
//
//           // validate
//           if (
//             !payload.user_name ||
//             !payload.text ||
//             !payload.channel_id ||
//             !payload.channel_name
//           ) {
//             return DataResult.error('Invalid form body.');
//           }
//
//           const user = await getOrCreateUser(payload.user_name);
//
//           await createEntry(user._id, {
//             type: 'slack',
//             text: payload.text,
//             channel: {
//               name: payload.channel_name,
//               id: payload.channel_id
//             }
//           });
//
//           return DataResult.ok({
//             value: 'ok'
//           });
//         }
//       },
//       {
//         middleware: [validateSlackToken]
//       }
//     )
//   ]
// });
