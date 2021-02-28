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
  SlackEventBody,
  SlackEventUrlVerificationBody,
  SlackLogBody
} from '../schemas/slack.schema';
import { getOrCreateUser } from '../services/user-profile.service';
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
