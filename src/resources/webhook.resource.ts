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
  SlackEventUrlVerificationBody
} from '../schemas/slack.schema';

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

    data(
      '/slack/log',
      {
        post: async (context: RouteContext) => {
          console.log(context);
          return DataResult.ok();
        }
      },
      {
        middleware: [validateSlackToken]
      }
    )
  ]
});
