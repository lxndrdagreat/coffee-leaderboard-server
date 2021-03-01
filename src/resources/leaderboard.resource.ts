import { data, DataResult, unthinkResource } from '@epandco/unthink-foundation';
import { getLeaderboard } from '../services/leaderboard.service';
import { requireAppAuthMiddleware } from '../middleware/require-app-auth.middleware';

export default unthinkResource({
  name: 'Leaderboard',
  basePath: '/leaderboard',
  routes: [
    data(
      '/',
      {
        get: async (_context) => {
          const leaderboard = await getLeaderboard();

          return DataResult.ok({
            value: leaderboard
          });
        }
      },
      {
        middleware: [requireAppAuthMiddleware]
      }
    )
  ]
});
