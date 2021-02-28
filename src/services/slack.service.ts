import {
  dataMiddleware,
  MiddlewareResult,
  RouteContext
} from '@epandco/unthink-foundation';
import { slackToken } from '../config/config';
import { SlackEventBody, SlackMessageBody } from '../schemas/slack.schema';

export async function hashSlackSignature(
  requestBody: string,
  timestampHeader: string
): Promise<string> {
  const basestring = `v0:${timestampHeader}${requestBody}`;
  const hashed = `${basestring}`;
  // hashed = base64.b64encode(hmac.new(settings.SLACK_SIGNING_SECRET, sig_basestring, digestmod=hashlib.sha256).hexdigest())
  return `v0=${hashed}`;
}

export const validateSlackWebhook = dataMiddleware(
  (context: RouteContext): MiddlewareResult => {
    if (
      !context.headers ||
      !context.headers.hasOwnProperty('x-slack-signature')
    ) {
      return MiddlewareResult.unauthorized();
    }

    const slackSignature = context.headers['x-slack-signature'];
    console.log(slackSignature);
    // TODO: compare signature

    const payload = context.body as SlackEventBody;

    if (!payload.type) {
      return MiddlewareResult.unauthorized();
    }

    return MiddlewareResult.continue();
  }
);

export const validateSlackToken = dataMiddleware(
  (context: RouteContext): MiddlewareResult => {
    if (!context.body) {
      return MiddlewareResult.unauthorized();
    }

    const payload = context.body as SlackMessageBody;
    if (!payload.token || payload.token !== slackToken) {
      return MiddlewareResult.unauthorized();
    }

    return MiddlewareResult.continue();
  }
);
