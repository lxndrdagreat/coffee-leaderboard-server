import {
  unthinkResource,
  data,
  DataResult,
  RouteContext
} from '@epandco/unthink-foundation';
import { AppAuthRequestModel } from '../schemas/user-app-token.schema';
import { confirmServiceAuth } from '../services/user-profile.service';

export default unthinkResource({
  name: 'App',
  basePath: 'app',
  routes: [
    /**
     * Handle :coffee: requests coming in from slack
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
    })
  ]
});
