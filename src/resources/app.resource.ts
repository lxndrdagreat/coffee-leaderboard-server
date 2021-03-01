import {
  unthinkResource,
  data,
  DataResult,
  RouteContext
} from '@epandco/unthink-foundation';
import { AppAuthRequestModel } from '../schemas/user-app-token.schema';
import {
  confirmServiceAuth,
  getUserByAppToken,
  UserNotFoundError
} from '../services/user-profile.service';
import { LogRequestModel } from '../schemas/log-request.model';
import { createEntry } from '../services/entry.service';

export default unthinkResource({
  name: 'App',
  basePath: 'app',
  routes: [
    /**
     * Handle authorizing apps
     */
    data('/auth', {
      post: async (context: RouteContext) => {
        const payload = context.body as AppAuthRequestModel;

        if (!payload.token || !payload.app || !payload.serviceName) {
          return DataResult.error('Invalid request body.');
        }

        try {
          const [{ userName }, { appToken }] = await confirmServiceAuth(
            payload
          );
          return DataResult.ok({
            value: {
              token: appToken,
              userName: userName
            }
          });
        } catch (e) {
          return DataResult.error(e);
        }
      }
    }),

    /**
     * App-based logging
     */
    data('/log', {
      post: async (context) => {
        const payload = context.body as LogRequestModel;
        if (!payload.token || !payload.message) {
          return DataResult.error('Invalid request.');
        }

        try {
          const result = await getUserByAppToken(payload.token);
          await createEntry(result._id, {
            type: 'app',
            text: payload.message,
            app: result.app
          });

          // TODO: outbound message to Slack Bot

          return DataResult.ok({
            value: 'ok'
          });
        } catch (e) {
          if (e instanceof UserNotFoundError) {
            return DataResult.error('User not found.');
          }
          return DataResult.error(e);
        }
      }
    })
  ]
});
