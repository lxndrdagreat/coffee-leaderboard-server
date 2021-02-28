import MissingRouteResource from './resources/missing-route-resource';
import WebhookResource from './resources/webhook.resource';

/** Add new resources to the list below */
export default [
  WebhookResource,
  /* To catch all routes not defined by the resources above */
  MissingRouteResource
];
