import {
  unthinkResource,
  data,
  DataResult,
  RouteContext
} from '@epandco/unthink-foundation';
import {
  validateSlackToken,
  validateSlackWebhook
} from '../services/slack.service';
import {
  SlackCreateAppAuthRequestBody,
  SlackEventBody,
  SlackEventUrlVerificationBody,
  SlackLogBody
} from '../schemas/slack.schema';
import {
  createServiceAuth,
  getOrCreateUser,
  getUserByUsername
} from '../services/user-profile.service';
import { createEntry } from '../services/entry.service';

export default unthinkResource({
  name: 'Webhooks',
  basePath: 'webhooks',
  routes: [
    data(
      '/slack/event',
      {
        post: async (context: RouteContext) => {
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
        }
      },
      {
        middleware: [validateSlackToken, validateSlackWebhook]
      }
    ),

    /**
     * Create App auth integration via Slack
     */
    data(
      '/slack/create-auth',
      {
        post: async (context) => {
          const body = context.body as SlackCreateAppAuthRequestBody;
          if (!body.user_name) {
            return DataResult.error(
              'Invalid request: user_name field is missing.'
            );
          }

          try {
            // TODO: maybe allow "getOrCreateUser"?
            const user = await getUserByUsername(body.user_name);
            const [, app] = await createServiceAuth(user._id, 'slack');
            return DataResult.ok({
              value: {
                // only show to the user who talked to the bot
                response_type: 'ephemeral',
                text:
                  'Copy/paste this authentication token into the Coffee Leaderboard App:',
                attachments: [
                  {
                    text: app.serviceToken
                  }
                ]
              }
            });
          } catch (e) {
            context.logger.error(e);
            return DataResult.error('Failed to create integration.');
          }
        }
      },
      {
        middleware: [validateSlackToken]
      }
    ),

    /**
     * Handle :coffee: requests coming in from slack
     */
    data(
      '/slack/log',
      {
        post: async (context: RouteContext) => {
          const payload = context.body as SlackLogBody;

          // validate
          if (
            !payload.user_name ||
            !payload.text ||
            !payload.channel_id ||
            !payload.channel_name
          ) {
            return DataResult.error('Invalid form body.');
          }

          const user = await getOrCreateUser(payload.user_name);

          await createEntry(user._id, {
            type: 'slack',
            text: payload.text,
            channel: {
              name: payload.channel_name,
              id: payload.channel_id
            }
          });

          return DataResult.ok({
            value: 'ok'
          });
        }
      },
      {
        middleware: [validateSlackToken]
      }
    )
  ]
});
