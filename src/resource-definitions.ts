import MissingRouteResource from './resources/missing-route-resource';
import WebhookResource from './resources/webhook.resource';
import AppResource from './resources/app.resource';
import LeaderboardResource from './resources/leaderboard.resource';

/** Add new resources to the list below */
export default [
  WebhookResource,
  AppResource,
  LeaderboardResource,
  /* To catch all routes not defined by the resources above */
  MissingRouteResource
];
