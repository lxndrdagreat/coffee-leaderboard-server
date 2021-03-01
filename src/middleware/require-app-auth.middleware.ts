import {
  dataMiddleware,
  MiddlewareResult,
  RouteContext
} from '@epandco/unthink-foundation';
import { getUserByAppToken } from '../services/user-profile.service';

export const requireAppAuthMiddleware = dataMiddleware(
  async (context: RouteContext): Promise<MiddlewareResult> => {
    if (!context.headers || !context.headers['x-app-token']) {
      return MiddlewareResult.unauthorized();
    }

    const token = context.headers['x-app-token'];
    try {
      await getUserByAppToken(token);
    } catch (e) {
      return MiddlewareResult.unauthorized();
    }

    return MiddlewareResult.continue();
  }
);
